from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from .serializers import RegisterWorkerSerializer, RegisterEmployerSerializer, LoginWorkerSerializer, LoginEmployerSerializer
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

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
    """
    Returns a list of all verified workers.
    """
    serializer_class = RegisterWorkerSerializer 
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Updated 'role' to match your model choice 'worker'
        return User.objects.filter(role='worker', is_verified=True)
    
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