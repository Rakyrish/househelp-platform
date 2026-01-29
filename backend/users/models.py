from django.contrib.auth.models import AbstractUser, Group, Permission
from django.conf import settings
from django.db import models
from django.db.models import UniqueConstraint, Q



class User(AbstractUser):
    ROLE_CHOICES = (
        ('employer', 'Employer'),
        ('worker', 'Worker'),
        ('admin', 'Admin'),
    )

    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )

    # Added to match Frontend choices
    EXPERIENCE_CHOICES = (
        ('none', 'None'),
        ('few months', 'Less than a year'),
        ('1-3', '1-3 years'),
        ('3-5', '3-5 years'),
        ('5+', 'More than 5 years'),
    )

    WORKER_TYPE = (
        ('general_househelp', 'General Househelp'),
        ('nanny', 'Nanny'),
        ('house_cleaner', 'House Cleaner'),
        ('cook', 'Cook'),
        ('gardener', 'Gardener'),
        ('elderly', 'Elderly Care'),
        ('other', 'Other'),
    )
  
    STATUS_CHOICES = (
        ('pending', 'Pending Verification'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('banned', 'Banned'),
    )

    ACCOMMODATION_CHOICES = (
        ('live_in', 'Live In'),
        ('live_out', 'Live Out'),
    )
    accommodation = models.CharField(
        max_length=20, 
        choices=ACCOMMODATION_CHOICES, 
        null=True, 
        blank=True
    )
    
    is_available = models.BooleanField(default=True)
    current_employer = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    requirements = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='other')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='worker')
    worker_type = models.CharField(max_length=30, choices=WORKER_TYPE, null=True, blank=True)
    experience = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, null=True, blank=True) # New
    is_deleted = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    phone = models.CharField(max_length=20, unique=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    age = models.CharField(max_length=3, blank=True, null=True)
    family_size = models.CharField(max_length=20, blank=True, null=True)
    expected_salary = models.CharField(max_length=15, blank=True, null=True)
    salary = models.CharField(max_length=15, blank=True, null=True)
    
    # --- TRACEABILITY FIELDS ---
    id_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    id_photo_front = models.ImageField(upload_to='identity/front/', null=True, blank=True)
    id_photo_back = models.ImageField(upload_to='identity/back/', null=True, blank=True)
    passport_img = models.ImageField(upload_to='identity/passport/', null=True, blank=True) # New

    # Emergency Contact / Next of Kin
    kin_name = models.CharField(max_length=100, null=True, blank=True)
    kin_phone = models.CharField(max_length=20, null=True, blank=True)
    kin_relationship = models.CharField(max_length=50, null=True, blank=True)

    home_address_description = models.TextField(help_text="Directions", null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    groups = models.ManyToManyField(Group, related_name='custom_users', blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name='custom_users_permissions', blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
    

class VerificationLog(models.Model):
    worker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_history')
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='performed_actions')
    action = models.CharField(max_length=20)
    rejection_reasons = models.JSONField(null=True, blank=True)
    comment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]

    employer = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='bookings_made',
        null=True,
        blank=True
    )
    worker = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='booking_requests',
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)


    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['employer', 'worker', 'status'],
                condition=Q(status='pending'), # Only one PENDING booking allowed at a time
                name='unique_active_booking'
            )
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employer.first_name} -> {self.worker.first_name} ({self.status})"
class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon_emoji = models.CharField(max_length=10, default="💼")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class PlatformSetting(models.Model):
    maintenance_mode = models.BooleanField(default=False)
    broadcast_message = models.TextField(blank=True, null=True)
    allow_new_registrations = models.BooleanField(default=True)
    support_email = models.EmailField(default="support@kykam.com")
    platform_fee_info = models.TextField(default="Kyam keeps it free for now!")

    class Meta:
        verbose_name_plural = "Platform Settings"

    def __str__(self):
        return "Global Platform Configuration"
