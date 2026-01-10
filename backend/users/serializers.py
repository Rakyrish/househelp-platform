from rest_framework import serializers
# from django.contrib.auth import get_user_model
from .models import User

# User = get_user_model()

class RegisterWorkerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)


    class Meta:
        model = User
        fields = [
            'full_name', 'password', 'email', 'phone', 'location', 'age',
            'id_number', 'id_photo_front', 'id_photo_back', 
            'kin_name', 'kin_phone', 'kin_relationship', 'gender'
        ]

    def create(self, validated_data):
        # 1. Extract name and email
        full_name = validated_data.pop('full_name', '')
        email = validated_data.get('email')
        
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        # 2. Use email as the username to satisfy Django's requirement
        user = User.objects.create_user(
            username=email,  # <--- Added this line
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
        fields = ['full_name', 'password', 'email', 'phone', 'location', 'family_size', 'worker_type']

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