from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from rest_framework import generics, status, filters as drf_filters
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from ..serializers import (
    LoginAdminSerializer, RegisterWorkerSerializer, RegisterEmployerSerializer, 
    LoginWorkerSerializer, LoginEmployerSerializer,
)
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.views import APIView
from django.conf import settings
from django.utils import timezone
from rest_framework.permissions import IsAdminUser

User = get_user_model()

def rotate_token(user):
    """
    Deletes existing token and creates a new one to reset 
    the 'created' timestamp for expiration logic.
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
            # Reset token timer on login
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

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            # Reset token timer on login
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

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        # Reset token timer on login
        token = rotate_token(user)
        return Response({
            "token": token.key,
            "role": user.role,
            "name": f"{user.first_name} {user.last_name}",
            "redirect": "/admin",
        }, status=status.HTTP_200_OK)

class LogoutView(generics.GenericAPIView):
    """
    Standard logout to invalidate the current token immediately.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth.delete() # Deletes the Token object from DB
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
    
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        print(f"--- Reset request for: {email} ---") # Check if email is received
        
        user = User.objects.filter(email__iexact=email).first()
        
        if user:
            print(f"--- User found: {user.username} ---")
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
           
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

            
            try:
                print("--- Attempting to send email via SMTP... ---")
                send_mail(
                    "Password Reset Request",
                    f"Click the link below to reset your password:\n{reset_url}",
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                print("--- EMAIL SENT SUCCESSFULLY! Check Sent folder. ---")
            except Exception as e:
                print(f"--- EMAIL FAILED! Error: {str(e)} ---")
                # For debugging, return the error to the frontend (remove this in production)
                return Response({"error": f"Mail system error: {str(e)}"}, status=500)
        else:
            print("--- NO USER FOUND with that email. ---")
        
        return Response({"message": "If an account exists, a link has been sent."}, status=200)
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

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
            # Important: Delete existing tokens so they must log in fresh
            Token.objects.filter(user=user).delete()
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid or expired link."}, status=status.HTTP_400_BAD_REQUEST)
    
class SoftDeleteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id, is_deleted=False)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        user.is_deleted = True
        user.deleted_at = timezone.now()
        user.is_active = False  # VERY IMPORTANT
        user.save()

        # Kill tokens immediately
        Token.objects.filter(user=user).delete()

        return Response(
            {"message": "User moved to trash successfully."},
            status=status.HTTP_200_OK
        )
    
class PermanentDeleteUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, user_id):
        confirm = request.query_params.get("confirm")

        if confirm != "true":
            return Response(
                {
                    "error": "Confirmation required",
                    "hint": "Add ?confirm=true to permanently delete this user"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Prevent self-deletion
        if user == request.user:
            return Response(
                {"error": "You cannot delete your own account"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Delete related auth tokens
        Token.objects.filter(user=user).delete()

        # HARD DELETE
        user.delete()

        return Response(
            {"message": "User permanently deleted from system"},
            status=status.HTTP_200_OK
        )
    
class DeactivateMyAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user

        if user.is_deleted:
            return Response(
                {"error": "Account already deactivated"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_deleted = True
        user.deleted_at = timezone.now()
        user.is_active = False
        user.save()

        # Kill all sessions immediately
        Token.objects.filter(user=user).delete()

        return Response(
            {"message": "Your account has been deactivated successfully."},
            status=status.HTTP_200_OK
        )