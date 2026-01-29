from django.contrib.auth import get_user_model, update_session_auth_hash
from django.db.models import Count, Q
from rest_framework import  viewsets, filters as drf_filters
from rest_framework.response import Response

from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import  IsAdminUser,AllowAny, IsAuthenticated

from ..models import VerificationLog, Booking, Category, PlatformSetting
from ..serializers import (
 AdminUserDetailSerializer,CategorySerializer,PlatformSettingsSerializer
)
from ..utils import send_verification_email
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings


User = get_user_model()

class AdminUserManagementViewSet(viewsets.ModelViewSet):
    serializer_class = AdminUserDetailSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [drf_filters.SearchFilter]
    search_fields = ['username', 'phone', 'id_number', 'first_name', 'last_name']

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')
        trash = self.request.query_params.get('trash')
        if trash == 'true': queryset = queryset.filter(is_deleted=True)
        elif trash == 'false': queryset = queryset.filter(is_deleted=False)
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        # 1. Run the main user aggregate first (this creates the 'stats' variable)
        stats = User.objects.aggregate(
            total_users=Count('id'),
            active_users=Count('id', filter=Q(is_deleted=False)),
            trashed_users=Count('id', filter=Q(is_deleted=True)),
            pending=Count('id', filter=Q(status='pending')),
            approved=Count('id', filter=Q(status='approved')),
            rejected=Count('id', filter=Q(status='rejected')),
            banned=Count('id', filter=Q(status='banned')),
            workers=Count('id', filter=Q(role='worker')),
            employers=Count('id', filter=Q(role='employer')),
        )
        
        # 2. Now that 'stats' is a dictionary, you can add new keys to it
        stats['active_hires'] = Booking.objects.filter(status='accepted').count()
        
        return Response(stats)

    @action(detail=True, methods=['post'])
    def approve_worker(self, request, pk=None):
        user = self.get_object()
        user.is_verified, user.status, user.is_active = True, 'approved', True
        user.save()
        VerificationLog.objects.create(worker=user, admin=request.user, action='approved')
        send_verification_email(user, 'approved')
        return Response({'status': 'User approved'})

    @action(detail=True, methods=['post'])
    def reject_worker(self, request, pk=None):
        user = self.get_object()
        reasons, comment = request.data.get('reasons', []), request.data.get('comment', '')
        user.status, user.is_verified = 'rejected', False
        user.save()
        VerificationLog.objects.create(worker=user, admin=request.user, action='rejected', rejection_reasons=reasons, comment=comment)
        send_verification_email(user, 'rejected', reasons, comment)
        return Response({'status': 'User rejected'})

    @action(detail=True, methods=['post'])
    def trash_user(self, request, pk=None):
        user = self.get_object()
        user.is_deleted, user.is_active, user.status = True, False, 'banned'
        user.save()
        Token.objects.filter(user=user).delete()
        return Response({'status': 'User moved to trash'})

class AdminHiringRegistryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Booking.objects.select_related('employer', 'worker').all().order_by('-created_at')
    authentication_classes = [TokenAuthentication, SessionAuthentication]

    def list(self, request):
        queryset = self.get_queryset()
        data = [{
            "id": b.id,
            "employer_name": f"{b.employer.first_name} {b.employer.last_name}",
            "worker_name": f"{b.worker.first_name} {b.worker.last_name}",
            # If you went with the slug approach for worker_type:
            "worker_type": b.worker.worker_type, 
            "status": b.status,
            "created_at": b.created_at
        } for b in queryset]
        return Response(data)

    @action(detail=True, methods=['post'])
    def force_action(self, request, pk=None):
        booking = self.get_object()
        new_status = request.data.get('status')
        
        # Added 'completed' to your allowed admin actions
        if new_status in ['accepted', 'declined', 'completed']:
            booking.status = new_status
            booking.save()
            return Response({'status': f'Admin set status to {new_status}'})
        return Response({'error': 'Invalid status'}, status=400)

    @action(detail=True, methods=['delete'])
    def withdraw_request(self, request, pk=None):
        booking = self.get_object()
        booking.delete()
        return Response({'status': 'Deleted successfully'}, status=204)

class CategoryViewSet(viewsets.ModelViewSet):
    """Manages Job Categories"""
    permission_classes = [IsAdminUser]
    serializer_class = CategorySerializer 
    queryset = Category.objects.all()

    def get_queryset(self):
        # 1. Fetch all categories
        categories = Category.objects.all().order_by('name')
        
        # 2. Manually add the worker_count to each category object
        # We do this by filtering the User table for matching worker_type strings
        for category in categories:
            category.worker_count = User.objects.filter(
                role='worker', 
                worker_type=category.slug # Matches "nanny" (slug) to "nanny" (CharField)
            ).count()
            
        return categories

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public_list(self, request):
        cats = Category.objects.filter(is_active=True)
        return Response([{"id": c.id, "name": c.name, "emoji": c.icon_emoji, "slug": c.slug} for c in cats])


   

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Allow GET/HEAD/OPTIONS for anyone (so they can see maintenance status)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only staff can change settings (POST/PUT/PATCH)
        return request.user and request.user.is_staff

class PlatformSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get(self, request):
        settings = PlatformSetting.objects.first()
        # 2. Use the imported Serializer class, not the model name
        serializer = PlatformSettingsSerializer(settings)
        return Response(serializer.data)

    def post(self, request):
        settings = PlatformSetting.objects.first()
        
        # 3. Use the imported Serializer class here as well
        if settings:
            serializer = PlatformSettingsSerializer(settings, data=request.data, partial=True)
        else:
            serializer = PlatformSettingsSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminUserPasswordResetView(APIView):
    # Ensure both token and session (for browser tests) are allowed
    authentication_classes = [TokenAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        # 1. Security Check
        if request.user.role != 'admin':
            return Response({"error": "Unauthorized: Admin access required"}, status=status.HTTP_403_FORBIDDEN)

        try:
            target_user = User.objects.get(id=user_id)
            new_password = request.data.get('password')

            if not new_password:
                return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Update Password
            target_user.set_password(new_password)
            target_user.save()

            # 3. Clean up existing tokens so the user is logged out everywhere
            Token.objects.filter(user=target_user).delete()

            # 4. Create Audit Log
            VerificationLog.objects.create(
                worker=target_user,
                admin=request.user,
                action="admin_password_reset",
                comment=f"Password manually reset by admin {request.user.first_name}"
            )

            return Response({"message": f"Password for {target_user.first_name} updated successfully."})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
class AdminPermanentDeleteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # ❌ Never allow admin to delete themselves
        if user == request.user:
            return Response(
                {"error": "You cannot permanently delete your own account"},
                status=status.HTTP_403_FORBIDDEN
            )

        # ❌ Only allow permanent delete IF already soft-deleted
        if not user.is_deleted:
            return Response(
                {"error": "User must be moved to trash before permanent deletion"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cleanup tokens
        Token.objects.filter(user=user).delete()

        # HARD DELETE (💀 irreversible)
        user.delete()

        return Response(
            {"message": "User permanently erased from the system"},
            status=status.HTTP_200_OK
        )
class ContactUsView(APIView):
    permission_classes = [AllowAny] # Allow everyone to contact you

    def post(self, request):
        name = request.data.get('name')
        sender_email = request.data.get('email')
        subject_text = request.data.get('subject')
        message_body = request.data.get('message')

        if not all([name, sender_email, message_body]):
            return Response({"error": "Please fill in all fields."}, status=400)

        # The email YOU receive
        full_subject = f"KYKAM INQUIRY: {subject_text}"
        
        html_content = f"""
        <h2>New Inquiry from Kykam Platform</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Reply to:</strong> {sender_email}</p>
        <p><strong>Message:</strong></p>
        <p>{message_body}</p>
        """
        
        text_content = strip_tags(html_content)

        try:
            msg = EmailMultiAlternatives(
                full_subject,
                text_content,
                settings.DEFAULT_FROM_EMAIL, 
                [settings.DEFAULT_FROM_EMAIL] 
            )
            # This allows you to click 'Reply' in your Gmail and email the user back directly
            msg.extra_headers = {'Reply-To': sender_email}
            msg.attach_alternative(html_content, "text/html")
            msg.send()

            return Response({"success": "Your message has been received. We will get back to you soon!"})
        except Exception as e:
            return Response({"error": "System busy. Please try again later."}, status=500)