from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import User
from .serializers import RegisterWorkerSerializer, RegisterEmployerSerializer

class RegisterWorkerView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterWorkerSerializer
    # This allows the view to handle file uploads
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Account created successfully. Awaiting verification.",
                "user": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class HelperListView(generics.ListAPIView):
    """
    This view returns a list of all verified househelps in the system.
    """
    serializer_class = RegisterWorkerSerializer 
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Only show verified househelps to the public
        return User.objects.filter(role='househelp', is_verified=True)
    
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
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)