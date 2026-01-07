from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

GENDER_CHOICES = (
    ('male', 'Male'),
    ('female', 'Female'),
)

OCCUPATION_CHOICES = [
    ('general_househelp', 'General Househelp'),
    ('nanny_childcare', 'Nanny/Childcare'),
    ('cook', 'Cook'),
    ('house_cleaner', 'House Cleaner'),
    ('elderly_care', 'Elderly Care'),
]


class RegisterWorkerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    Age = serializers.CharField(write_only=True)
    gender = serializers.ChoiceField(choices=GENDER_CHOICES)


    class Meta:
        model = User
        fields = [
            'full_name', 'password', 'email', 'phone', 'location', 'Age',
            'id_number', 'id_photo_front', 'id_photo_back', 
            'kin_name', 'kin_phone', 'kin_relationship', 'gender'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        # This handles all fields including the ImageFields
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class RegisterEmployerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    family_size = serializers.CharField(write_only=True)
    occupation = serializers.ChoiceField(choices=OCCUPATION_CHOICES)

    class Meta:
        model = User
        fields = ['full_name', 'password', 'email', 'phone', 'location', 'family_size', 'occupation']

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Force the role to employer regardless of what is sent
        user = User.objects.create_user(role='employer', **validated_data)
        user.set_password(password)
        # Employers are usually auto-verified to let them post jobs immediately
        user.is_verified = True 
        user.save()
        return user