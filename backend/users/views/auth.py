from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from django.http import JsonResponse
from django.middleware.csrf import get_token

from rest_framework import generics, status, filters as drf_filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authentication import TokenAuthentication
from ..serializers import (
    LoginAdminSerializer, RegisterWorkerSerializer, RegisterEmployerSerializer, 
    LoginWorkerSerializer, LoginEmployerSerializer,
)

# Import your custom CSRF-exempt class
# Ensure authentication.py is in the same folder as this file
from ..authentication import CsrfExemptSessionAuthentication

User = get_user_model()

def rotate_token(user):
    """
    Deletes existing token and creates a new one.
    """
    Token.objects.filter(user=user).delete()
    return Token.objects.create(user=user)

# -----------------------------------------------------------
# AUTHENTICATION & REGISTRATION
# -----------------------------------------------------------

class RegisterWorkerView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterWorkerSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]
    # Bypass CSRF and allow Token/Session auth
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

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
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

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
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token = rotate_token(user)
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
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token = rotate_token(user)
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
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        token = rotate_token(user)
        return Response({
            "token": token.key,
            "role": user.role,
            "name": f"{user.first_name} {user.last_name}",
            "redirect": "/admin",
        }, status=status.HTTP_200_OK)

class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def post(self, request):
        if request.auth:
            request.auth.delete() 
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)

# -----------------------------------------------------------
# PASSWORD MANAGEMENT & ACCOUNT DELETION
# -----------------------------------------------------------

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email__iexact=email).first()
        
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            
            try:
                send_mail(
                    "Password Reset Request",
                    f"Click the link below to reset your password:\n{reset_url}",
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
            except Exception as e:
                return Response({"error": f"Mail system error: {str(e)}"}, status=500)
        
        return Response({"message": "If an account exists, a link has been sent."}, status=200)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            new_password = request.data.get('password')
            user.set_password(new_password)
            user.save()
            Token.objects.filter(user=user).delete()
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid or expired link."}, status=status.HTTP_400_BAD_REQUEST)

class SoftDeleteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, is_deleted=False)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.is_deleted = True
        user.deleted_at = timezone.now()
        user.is_active = False
        user.save()
        Token.objects.filter(user=user).delete()

        return Response({"message": "User moved to trash successfully."}, status=status.HTTP_200_OK)

class PermanentDeleteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def delete(self, request, user_id):
        confirm = request.query_params.get("confirm")
        if confirm != "true":
            return Response({"error": "Confirmation required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if user == request.user:
            return Response({"error": "You cannot delete your own account"}, status=status.HTTP_403_FORBIDDEN)

        Token.objects.filter(user=user).delete()
        user.delete()
        return Response({"message": "User permanently deleted"}, status=status.HTTP_200_OK)

class DeactivateMyAccountView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CsrfExemptSessionAuthentication, TokenAuthentication]

    def patch(self, request):
        user = request.user
        user.is_deleted = True
        user.deleted_at = timezone.now()
        user.is_active = False
        user.save()
        Token.objects.filter(user=user).delete()
        return Response({"message": "Account deactivated."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def set_csrf_token(request):
    """
    Optional helper to set CSRF cookie. 
    Note: Since we are bypassing CSRF, this is technically redundant now.
    """
    token = get_token(request)
    return Response({"detail": "CSRF cookie set", "token": token}, status=status.HTTP_200_OK)