from rest_framework import generics, status, permissions, viewsets, filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import LoginAdminSerializer, RegisterWorkerSerializer, RegisterEmployerSerializer, LoginWorkerSerializer, LoginEmployerSerializer, AdminUserDetailSerializer
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.filters import SearchFilter
from .utils import send_verification_email
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Count, Q
from .models import User, VerificationLog
from .serializers import AdminUserDetailSerializer




User = get_user_model()

class RegisterWorkerView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterWorkerSerializer
    # Crucial for handling ID photo uploads
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Worker account created successfully. Awaiting verification.",
                "user": {
                    "email": user.email,
                    "first_name": user.first_name,
                    "role": user.role
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HelperListView(generics.ListAPIView):
    serializer_class = RegisterWorkerSerializer 
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Only show workers who are verified, active, AND not deleted
        return User.objects.filter(
            role='worker', 
            # is_verified=True, 
            # is_active=True, 
            is_deleted=False
        )
    
class RegisterEmployerView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterEmployerSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Employer account created successfully.",
                "user": {
                    "email": user.email,
                    "first_name": user.first_name,
                    "role": user.role
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Change APIView to generics.GenericAPIView
class WorkerLoginView(generics.GenericAPIView):
    """
    Handles worker login and token generation.
    """
    # This line makes the HTML form appear in the browser!
    serializer_class = LoginWorkerSerializer
    permission_classes = [permissions.AllowAny]

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
    """
    Handles employer login and token generation.
    """
    # This line makes the HTML form appear in the browser!
    serializer_class = LoginEmployerSerializer
    permission_classes = [permissions.AllowAny]

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
    """
    Docstring for AdminLoginView
    """
    permission_classes = [AllowAny]
    serializer_class = LoginAdminSerializer  

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "role": user.role,
                "name": f"{user.first_name} {user.last_name}",
                "redirect": "/admin",
            },
            status=status.HTTP_200_OK,
        )


class AdminUserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing users:
    - Active users
    - Trash bin (soft deleted users)
    - Restore & permanent delete
    - Verification & banning
    """

    serializer_class = AdminUserDetailSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'phone', 'id_number', 'first_name', 'last_name']

    # ----------------------------
    # QUERYSET (ACTIVE / TRASH)
    # ----------------------------
    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')

        trash = self.request.query_params.get('trash')
        if trash == 'true':
            queryset = queryset.filter(is_deleted=True)
        elif trash == 'false':
            queryset = queryset.filter(is_deleted=False)

        return queryset

    # ----------------------------
    # DASHBOARD STATS
    # ----------------------------
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
    

    # ----------------------------
    # APPROVE WORKER
    # ----------------------------
    @action(detail=True, methods=['post'])
    def approve_worker(self, request, pk=None):
        user = self.get_object()
        user.is_verified = True
        user.status = 'approved'
        user.is_active = True
        user.save()

        VerificationLog.objects.create(
            worker=user,
            admin=request.user,
            action='approved'
        )

        send_verification_email(user, 'approved')

        return Response({'status': 'User approved'})

    # ----------------------------
    # REJECT WORKER
    # ----------------------------
    @action(detail=True, methods=['post'])
    def reject_worker(self, request, pk=None):
        user = self.get_object()
        reasons = request.data.get('reasons', [])
        comment = request.data.get('comment', '')

        user.status = 'rejected'
        user.is_verified = False
        user.save()

        VerificationLog.objects.create(
            worker=user,
            admin=request.user,
            action='rejected',
            rejection_reasons=reasons,
            comment=comment
        )

        send_verification_email(user, 'rejected', reasons, comment)

        return Response({'status': 'User rejected'})

    # ----------------------------
    # FORCE LOGOUT USER
    # ----------------------------
    @action(detail=True, methods=['post'])
    def logout_user(self, request, pk=None):
        user = self.get_object()
        Token.objects.filter(user=user).delete()

        VerificationLog.objects.create(
            worker=user,
            admin=request.user,
            action='logout',
            comment="Admin forced logout"
        )

        return Response({'status': 'User logged out'})

    # ----------------------------
    # MOVE TO TRASH (SOFT DELETE)
    # ----------------------------
    @action(detail=True, methods=['post'])
    def trash_user(self, request, pk=None):
        user = self.get_object()

        user.is_deleted = True
        user.is_active = False
        user.status = 'banned'
        user.save()

        Token.objects.filter(user=user).delete()

        VerificationLog.objects.create(
            worker=user,
            admin=request.user,
            action='trashed',
            comment="User moved to trash"
        )

        return Response({'status': 'User moved to trash'})

    # ----------------------------
    # RESTORE FROM TRASH
    # ----------------------------
    @action(detail=True, methods=['post'])
    def restore_user(self, request, pk=None):
        user = User.objects.get(pk=pk)

        user.is_deleted = False
        user.is_active = True
        user.status = 'pending'
        user.save()

        VerificationLog.objects.create(
            worker=user,
            admin=request.user,
            action='restored',
            comment="User restored from trash"
        )

        return Response({'status': 'User restored'})

    # ----------------------------
    # PERMANENT DELETE
    # ----------------------------
    @action(detail=True, methods=['delete'])
    def permanent_erase(self, request, pk=None):
        user = User.objects.get(pk=pk)
        username = user.username

        VerificationLog.objects.filter(worker=user).delete()
        Token.objects.filter(user=user).delete()
        user.delete()

        return Response(
            {'status': f'User {username} permanently deleted'},
            status=status.HTTP_204_NO_CONTENT
        )

    # ----------------------------
    # VERIFICATION HISTORY
    # ----------------------------
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        user = User.objects.get(pk=pk)
        logs = user.verification_history.all().order_by('-created_at')

        data = [
            {
                'id': log.id,
                'admin_name': log.admin.get_full_name() if log.admin else 'System',
                'action': log.action,
                'reasons': log.rejection_reasons,
                'comment': log.comment,
                'created_at': log.created_at,
            }
            for log in logs
        ]

        return Response(data)
