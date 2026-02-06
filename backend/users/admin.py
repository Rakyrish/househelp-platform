from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Booking, Category, PlatformSetting, VerificationLog

# Customizing the Admin Header
admin.site.site_header = "Kykam Agency Command Center"
admin.site.site_title = "Kykam Admin Portal"
admin.site.index_title = "Welcome to Kykam Management"

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # --- LIST VIEW CONFIGURATION ---
    list_display = (
        'full_name', 'role', 'phone', 'colored_status', 
        'is_verified', 'worker_type', 'display_thumbnail', 'date_joined'
    )
    list_filter = ('role', 'status', 'is_verified', 'worker_type', 'location')
    search_fields = ('username', 'first_name', 'last_name', 'id_number', 'phone', 'email')
    list_editable = ('is_verified',)
    readonly_fields = (
        'display_id_front_large', 'display_id_back_large', 
        'display_passport_large', 'date_joined', 'last_login'
    )
    
    # --- DASHBOARD METRICS ---
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        # Metrics for the top boxes
        extra_context['pending_workers'] = User.objects.filter(role='worker', status='pending').count()
        extra_context['new_bookings'] = Booking.objects.filter(status='pending').count()
        extra_context['active_employers'] = User.objects.filter(role='employer', is_verified=True).count()
        return super().changelist_view(request, extra_context=extra_context)

    # --- COLOR CODED STATUS ---
    def colored_status(self, obj):
        colors = {
            'pending': '#f3a82f',  # Kykam Orange
            'approved': '#28a745', # Success Green
            'rejected': '#dc3545', # Danger Red
            'banned': '#000000',   # Neutral Black
        }
        return format_html(
            '<span style="color: white; background-color: {}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">{}</span>',
            colors.get(obj.status, '#6c757d'),
            obj.get_status_display()
        )
    colored_status.short_description = 'Verification Status'

    # --- CUSTOM ACTIONS ---
    actions = ['approve_and_notify', 'reject_and_notify']

    @admin.action(description="Approve & Send Welcome Email")
    def approve_and_notify(self, request, queryset):
        for user in queryset:
            user.status = 'approved'
            user.is_verified = True
            user.save()
            # Send Email to Worker
            try:
                send_mail(
                    "Account Verified - Kykam Agency",
                    f"Hello {user.first_name}, your account has been verified! You are now visible to employers.",
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=True,
                )
            except Exception:
                pass
        self.message_user(request, f"Approved {queryset.count()} users and sent notifications.", messages.SUCCESS)

    @admin.action(description="Reject & Request New ID")
    def reject_and_notify(self, request, queryset):
        queryset.update(status='rejected', is_verified=False)
        self.message_user(request, "Users rejected. Please manually email them the reason.", messages.WARNING)

    # --- IMAGE RENDERING ---
    def display_thumbnail(self, obj):
        if obj.id_photo_front:
            return format_html('<img src="{}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 8px; border: 1px solid #eee;" />', obj.id_photo_front.url)
        return format_html('<span style="color: #999;">No Image</span>')
    display_thumbnail.short_description = 'ID Preview'

    def display_id_front_large(self, obj):
        if obj.id_photo_front:
            return format_html('<a href="{0}" target="_blank"><img src="{0}" width="500" style="border: 5px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1);" /></a>', obj.id_photo_front.url)
        return "No File"

    def display_id_back_large(self, obj):
        if obj.id_photo_back:
            return format_html('<a href="{0}" target="_blank"><img src="{0}" width="500" style="border: 5px solid #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1);" /></a>', obj.id_photo_back.url)
        return "No File"

    def display_passport_large(self, obj):
        if obj.passport_img:
            return format_html('<a href="{0}" target="_blank"><img src="{0}" width="200" style="border-radius: 10px;" /></a>', obj.passport_img.url)
        return "No File"

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'User Name'

    # --- DETAIL VIEW LAYOUT ---
    fieldsets = (
        ('Account Status', {
            'fields': ('status', 'is_verified', 'is_active', 'is_available')
        }),
        ('User Credentials', {
            'fields': ('username', 'email', 'phone', 'role')
        }),
        ('Verification Documents', {
            'fields': (
                'id_number', 
                'display_id_front_large', 'id_photo_front', 
                'display_id_back_large', 'id_photo_back', 
                'display_passport_large', 'passport_img'
            )
        }),
        ('Profile Data', {
            'fields': ('first_name', 'last_name', 'gender', 'age', 'location', 'home_address_description')
        }),
        ('Worker/Employer Specifics', {
            'classes': ('collapse',),
            'fields': ('worker_type', 'experience', 'expected_salary', 'accommodation', 'family_size', 'salary', 'requirements', 'start_date')
        }),
    )

# --- SUPPORTING MODELS ---
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('employer', 'worker', 'status', 'created_at')
    list_filter = ('status',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(PlatformSetting)
class PlatformSettingAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not PlatformSetting.objects.exists()