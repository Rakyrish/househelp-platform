from django.contrib.auth import get_user_model, update_session_auth_hash
from django.db.models import Count, Q
from rest_framework import generics, status, permissions, viewsets, filters as drf_filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated

from .models import VerificationLog, Booking
from .serializers import (
    LoginAdminSerializer, RegisterWorkerSerializer, RegisterEmployerSerializer, 
    LoginWorkerSerializer, LoginEmployerSerializer, AdminUserDetailSerializer, WorkerSerializer
)
from .utils import send_verification_email

User = get_user_model()

# -----------------------------------------------------------
# AUTHENTICATION & REGISTRATION
# -----------------------------------------------------------

class RegisterWorkerView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterWorkerSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Worker account created successfully.",
                "user": {"email": user.email, "role": user.role}
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterEmployerView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterEmployerSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Employer account created successfully.",
                "user": {"email": user.email, "first_name": user.first_name, "role": user.role}
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkerLoginView(generics.GenericAPIView):
    serializer_class = LoginWorkerSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "Login successful",
                "token": token.key,
                "role": user.role,
                "name": f"{user.first_name} {user.last_name}",
                "redirect": "/dashboard/worker"
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class EmployerLoginView(generics.GenericAPIView):
    serializer_class = LoginEmployerSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "role": user.role,
                "name": f"{user.first_name} {user.last_name}",
                "redirect": "/dashboard/employer"
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class AdminLoginView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginAdminSerializer  

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "role": user.role,
            "name": f"{user.first_name} {user.last_name}",
            "redirect": "/admin",
        }, status=status.HTTP_200_OK)

# -----------------------------------------------------------
# WORKER DASHBOARD & DIRECTORY
# -----------------------------------------------------------

class WorkerDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def profile_status(self, request):
        user = request.user
        if user.role != 'worker':
            return Response({"error": "Not a worker"}, status=403)
        
        latest_log = VerificationLog.objects.filter(worker=user).order_by('-created_at').first()
        
        data = {
            "first_name": user.first_name,
            "status": user.status, 
            "is_verified": user.is_verified,
            "experience": user.experience,
            "worker_type": user.worker_type,
            "location": user.location,
            "date_joined": user.date_joined,
            "kin_name": user.kin_name,
            "kin_phone": user.kin_phone,
            "expected_salary": user.expected_salary,
            "passport_img": request.build_absolute_uri(user.passport_img.url) if user.passport_img else None,
            "id_photo_front": user.id_photo_front.url if user.id_photo_front else None,
            "id_photo_back": user.id_photo_back.url if user.id_photo_back else None,
            "missing_docs": {
                "id_front": not bool(user.id_photo_front),
                "id_back": not bool(user.id_photo_back),
                "passport": not bool(user.passport_img),
            },
            "rejection_feedback": latest_log.rejection_reasons if latest_log and user.status == 'rejected' else None,
            "admin_comment": latest_log.comment if latest_log and user.status == 'rejected' else None
        }
        return Response(data)

    @action(detail=False, methods=['patch'], parser_classes=[MultiPartParser, FormParser])
    def update_profile(self, request):
        user = request.user
        editable_text_fields = ['location', 'worker_type', 'experience', 'kin_name', 'kin_phone', 'expected_salary']
        
        for field in editable_text_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        
        if 'passport_img' in request.FILES:
            user.passport_img = request.FILES['passport_img']
        
        user.save()
        return Response({
            "message": "Profile updated successfully",
            "passport_img": request.build_absolute_uri(user.passport_img.url) if user.passport_img else None
        })

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not user.check_password(old_password):
            return Response({"error": "Current password is incorrect"}, status=400)
        
        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)
        return Response({"message": "Password updated successfully"})
    @action(detail=False, methods=['get'], url_path='job_invites')
    def job_invites(self, request):
        invites = Booking.objects.filter(worker=request.user).order_by('-created_at')
        data = [{
            "id": i.id,
            "employer_name": f"{i.employer.first_name} {i.employer.last_name}",
            "location": i.employer.location,
            "status": i.status,
            "salary": i.employer.salary,
            "created_at": i.created_at
        } for i in invites]
        return Response(data)

from django.db.models import Q

class WorkerViewSet(viewsets.ReadOnlyModelViewSet):
    """View used by Employers to find Workers"""
    permission_classes = [IsAuthenticated]
    serializer_class = WorkerSerializer # Use the one with 'my_request_status'

    def get_queryset(self):
        # 1. Start with basic filtered queryset
        queryset = User.objects.filter(role='worker', is_verified=True, is_deleted=False)
        params = self.request.query_params
        
        # 2. Extract Filters
        location = params.get('location')
        worker_type = params.get('worker_type')
        search = params.get('search')
        min_salary = params.get('min_salary')
        max_salary = params.get('max_salary')
        experience = params.get('experience')

        # 3. Apply Filtering
        if location: 
            queryset = queryset.filter(location__icontains=location)
        if worker_type and worker_type != 'all': 
            queryset = queryset.filter(worker_type=worker_type)
        if search:
            queryset = queryset.filter(Q(first_name__icontains=search) | Q(last_name__icontains=search))
        
        # NOTE: Since expected_salary is a CharField, __gte might fail on some DBs.
        # It is better to cast to integer if possible, but here is the standard filter:
        if min_salary: 
            queryset = queryset.filter(expected_salary__gte=min_salary)
        if max_salary: 
            queryset = queryset.filter(expected_salary__lte=max_salary)
        
        # Experience is a ChoiceField (string), __gte won't work logically. 
        # Usually, you filter for exact match on choices:
        if experience and experience != 'all':
            queryset = queryset.filter(experience=experience)

        return queryset.order_by('-date_joined')

    @action(detail=True, methods=['post'])
    def hire(self, request, pk=None):
        worker_user = self.get_object()
        
        # DEBUG: Check if employer is trying to hire themselves
        if request.user.id == worker_user.id:
            return Response({"error": "You cannot hire yourself."}, status=400)

        # Check for existing pending request
        existing = Booking.objects.filter(
            employer=request.user, 
            worker=worker_user, 
            status='pending'
        ).exists()

        if existing:
            return Response({"error": "You already have a pending request with this worker."}, status=400)

        # Create the booking
        Booking.objects.create(
            employer=request.user, 
            worker=worker_user, 
            status='pending'
        )

        # Email Notification
        try:
            send_mail(
                subject="New Hire Request - Kykam",
                message=f"Hi {worker_user.first_name}, {request.user.first_name} wants to hire you!",
                from_email="mbuguajohn367@gmail.com",
                recipient_list=[worker_user.email],
                fail_silently=True
            )
        except Exception as e:
            print(f"Email failed: {e}")

        return Response({"message": "Hire request sent!"})

    @action(detail=True, methods=['post'])
    def withdraw_request(self, request, pk=None):
        worker_user = self.get_object()
        # Only delete if it's still pending
        booking = Booking.objects.filter(
            employer=request.user, 
            worker=worker_user, 
            status='pending'
        ).first()

        if booking:
            booking.delete()
            return Response({"message": "Request withdrawn successfully."})
        return Response({"error": "No pending request found to withdraw."}, status=404)
# -----------------------------------------------------------
# 2. THE BOOKINGS (For Workers to see and respond to invites)
# -----------------------------------------------------------
class WorkerBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Booking.objects.all()

    # This fixes the 404 for /api/worker-requests/job_invites/
    @action(detail=False, methods=['get'], url_path='job_invites')
    def job_invites(self, request):
        invites = Booking.objects.filter(worker=request.user).order_by('-created_at')
        data = [{
            "id": i.id,
            "employer_name": f"{i.employer.first_name} {i.employer.last_name}",
            "location": i.employer.location,
            "status": i.status,
            "salary": i.employer.salary,
            "created_at": i.created_at
        } for i in invites]
        return Response(data)
    @action(detail=False, methods=['get'], url_path='my_invites')
    def my_invites(self, request):
        # We can just call the same logic as above
        return WorkerDashboardViewSet.job_invites(self, request)

    # This fixes the 404 for /api/worker-requests/{id}/respond_to_request/
    @action(detail=True, methods=['post'])
    def respond_to_request(self, request, pk=None):
        booking = self.get_object() # This correctly gets the Booking object
        new_status = request.data.get('status')

        if booking.worker != request.user:
            return Response({"error": "Unauthorized"}, status=403)

        if new_status in ['accepted', 'declined']:
            booking.status = new_status
            booking.save()
            return Response({"message": f"Request {new_status}"})
        return Response({"error": "Invalid status"}, status=400)

class EmployerDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if request.user.role != 'employer':
            return Response({"error": "Unauthorized"}, status=403)
        return Response({
            "total_sent": Booking.objects.filter(employer=request.user).count(),
            "accepted": Booking.objects.filter(employer=request.user, status='accepted').count()
        })

    @action(detail=False, methods=['get'])
    def my_requests(self, request):
        bookings = Booking.objects.filter(employer=request.user).select_related('worker')
        data = [{
            "id": b.id,
            "worker_name": f"{b.worker.first_name} {b.worker.last_name}",
            "status": b.status,
            "date": b.created_at,
            "worker_phone": b.worker.phone if b.status == 'accepted' else "Locked"
        } for b in bookings]
        return Response(data)

# -----------------------------------------------------------
# ADMIN MANAGEMENT
# -----------------------------------------------------------

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