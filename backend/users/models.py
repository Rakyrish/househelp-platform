from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('employer', 'Employer'),
        ('worker', 'Worker'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=100, blank=True, null=True)
    
    # --- TRACEABILITY FIELDS ---
    id_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    id_photo_front = models.ImageField(upload_to='identity/front/', null=True, blank=True)
    id_photo_back = models.ImageField(upload_to='identity/back/', null=True, blank=True)
    
    # Emergency Contact / Next of Kin (Crucial for tracing)
    kin_name = models.CharField(max_length=100, null=True, blank=True)
    kin_phone = models.CharField(max_length=20, null=True, blank=True)
    kin_relationship = models.CharField(max_length=50, null=True, blank=True)
    
    # Physical Verification
    home_address_description = models.TextField(help_text="Detailed directions to their home", null=True, blank=True)
    is_verified = models.BooleanField(default=False) # Manual check by you
    
    # Fix the reverse accessor clashes (Already in your code)
    groups = models.ManyToManyField(
        Group,
        related_name='custom_users',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name='custom_users_permissions',
        blank=True,
    )

    # def __str__(self):
    #     return f"{self.username} ({self.role})"