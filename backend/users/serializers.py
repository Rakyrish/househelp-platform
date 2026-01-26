from rest_framework import serializers
# from django.contrib.auth import get_user_model
from .models import User, Booking
from django.contrib.auth import authenticate
from rest_framework import serializers

# User = get_user_model()

class RegisterWorkerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'full_name', 'password', 'email', 'phone', 'location', 'age',
            'id_number', 'id_photo_front', 'id_photo_back', 'passport_img', 
            'kin_name', 'kin_phone', 'kin_relationship', 'gender', 'experience', 'expected_salary'
        ]

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        email = validated_data.get('email')
        
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=email,
            first_name=first_name,
            last_name=last_name,
            role='worker',
            **validated_data
        )
        return user

class RegisterEmployerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    # family_size = serializers.CharField(write_only=True)
   


    class Meta:
        model = User
        fields = ['full_name', 'password', 'email', 'phone', 'location', 'family_size', 'worker_type', 'salary', 'requirements', 'start_date', 'accommodation', 'id_number' ]

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        email = validated_data.get('email')
        
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        user = User.objects.create_user(
            username=email,  # <--- Added this line
            first_name=first_name,
            last_name=last_name,
            role='employer',
            is_verified=True,
            **validated_data
        )
        return user
    
class LoginWorkerSerializer(serializers.ModelSerializer): 
    # We redefine these to ensure they show up as simple inputs in the HTML form
    phone = serializers.CharField(label="Phone Number")
    password = serializers.CharField(
        style={'input_type': 'password'}, 
        write_only=True
    )

    class Meta:
        model = User
        fields = ['phone', 'password'] # Moved inside Meta

    def validate(self, data):
        phone = data.get('phone')
        password = data.get('password')

        # Using username=phone because the custom backend expects 'username'
        user = authenticate(username=phone, password=password)

        if not user:
            raise serializers.ValidationError("Invalid phone number or password.")

        if user.role != 'worker':
            raise serializers.ValidationError("Access denied. This account is not a Worker.")

        return user

class LoginEmployerSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(label="Phone Number")
    password = serializers.CharField(
        style={'input_type': 'password'}, 
        write_only=True
    )

    class Meta:
        model = User
        fields = ['phone', 'password'] 

    def validate(self, data):
        phone = data.get('phone')
        password = data.get('password')

        user = authenticate(username=phone, password=password)

        if not user:
            raise serializers.ValidationError("Invalid phone number or password.")

        if user.role != 'employer':
            raise serializers.ValidationError("Access denied. This account is not an Employer.")

        return user
    

class LoginAdminSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['phone', 'password']

    def validate(self, data):
        phone = data.get("phone")
        password = data.get("password")

        user = authenticate(username=phone, password=password)

        if not user:
            raise serializers.ValidationError("Invalid phone number or password.")

        if user.role != "admin":
            raise serializers.ValidationError(
                "Access denied. This account is not an Admin."
            )

        return user
class AdminUserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'phone', 
            'role', 'status', 'is_verified', 'id_number', 'family_size', 'salary', 'start_date',
            'id_photo_front', 'id_photo_back', 'location', 'age',
            'kin_name', 'kin_phone', 'worker_type', 'date_joined', 'passport_img', 'expected_salary', 'salary', 'requirements', 'accommodation'
        ]
class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'employer', 'worker', 'status', 'created_at']
        read_only_fields = ['employer', 'status']
        
class WorkerSerializer(serializers.ModelSerializer):
    my_request_status = serializers.SerializerMethodField()
    passport_img = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'worker_type', 'location', 
            'experience', 'expected_salary', 'passport_img', 'is_verified', 
            'status', 'my_request_status', 'phone', 'age', 'is_available', 'current_employer'
        ]

    def get_my_request_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check for any booking between this employer and this worker
            booking = Booking.objects.filter(employer=request.user, worker=obj).first()
            if booking:
                return booking.status
        return None

    def get_passport_img(self, obj):
        if obj.passport_img:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.passport_img.url)
        return None

