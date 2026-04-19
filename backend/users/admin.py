from django.contrib import admin
from django.db.models import Count
from django.utils.html import format_html
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Booking, Category, PlatformSetting, VerificationLog, PaymentTransaction, ManualPaymentSubmission

# Customizing the Admin Header
admin.site.site_header = "Kykam Agency Command Center"
admin.site.site_title = "Kykam Admin Portal"
admin.site.index_title = "Welcome to Kykam Management"

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # --- LIST VIEW CONFIGURATION ---
    list_display = (
        'full_name', 'role', 'phone', 'colored_status',
        'verification_status', 'verification_status_badge', 'is_verified', 'worker_type', 'display_thumbnail', 'date_joined'
    )
    list_filter = ('role', 'status', 'verification_status', 'is_verified', 'worker_type', 'location')
    search_fields = ('username', 'first_name', 'last_name', 'id_number', 'phone', 'email')
    list_editable = ('verification_status', 'is_verified')
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

    def verification_status_badge(self, obj):
        colors = {
            'unpaid': '#6c757d',
            'under_review': '#f3a82f',
            'verified': '#28a745',
            'rejected': '#dc3545',
        }
        return format_html(
            '<span style="color: white; background-color: {}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase;">{}</span>',
            colors.get(obj.verification_status, '#6c757d'),
            obj.get_verification_status_display()
        )
    verification_status_badge.short_description = 'Payment / Access'

    # --- CUSTOM ACTIONS ---
    actions = ['mark_paid_and_verified', 'mark_under_review', 'approve_and_notify', 'reject_and_notify']

    def normalize_verification_fields(self, user):
        if user.verification_status == 'verified' or user.is_verified:
            user.verification_status = 'verified'
            user.is_verified = True
            user.status = 'approved'
            user.is_active = True
            user.payment_submitted_at = None
        elif user.verification_status == 'rejected':
            user.is_verified = False
            user.status = 'rejected'
        elif user.verification_status == 'under_review':
            user.is_verified = False
        elif user.verification_status == 'unpaid':
            user.is_verified = False
            if user.status == 'approved':
                user.status = 'pending'

    def save_model(self, request, obj, form, change):
        self.normalize_verification_fields(obj)
        super().save_model(request, obj, form, change)

    @admin.action(description="Mark selected users as paid & verified")
    def mark_paid_and_verified(self, request, queryset):
        updated = 0
        for user in queryset:
            user.verification_status = 'verified'
            user.is_verified = True
            user.status = 'approved'
            user.is_active = True
            user.payment_submitted_at = None
            user.save(update_fields=['verification_status', 'is_verified', 'status', 'is_active', 'payment_submitted_at'])
            updated += 1
        self.message_user(request, f"Marked {updated} users as paid and verified.", messages.SUCCESS)

    @admin.action(description="Mark selected users as payment under review")
    def mark_under_review(self, request, queryset):
        updated = queryset.update(verification_status='under_review', is_verified=False)
        self.message_user(request, f"Marked {updated} users as under review.", messages.WARNING)

    @admin.action(description="Approve & Send Welcome Email")
    def approve_and_notify(self, request, queryset):
        for user in queryset:
            user.verification_status = 'verified'
            user.status = 'approved'
            user.is_verified = True
            user.is_active = True
            user.payment_submitted_at = None
            user.save(update_fields=['verification_status', 'status', 'is_verified', 'is_active', 'payment_submitted_at'])
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
        queryset.update(status='rejected', verification_status='rejected', is_verified=False)
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
            'fields': ('status', 'verification_status', 'is_verified', 'payment_submitted_at', 'is_active', 'is_available')
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

@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'amount', 'status_badge', 'transaction_id', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('phone_number', 'transaction_id', 'checkout_request_id', 'user__email', 'user__first_name')
    readonly_fields = ('checkout_request_id', 'merchant_request_id', 'raw_callback_data', 'created_at', 'updated_at', 'result_desc')
    
    def status_badge(self, obj):
        colors = {
            'SUCCESS': 'green',
            'FAILED': 'red',
            'CANCELLED': 'orange',
            'PENDING': 'blue'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: white; background-color: {}; padding: 3px 10px; border-radius: 10px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            obj.status
        )
    status_badge.short_description = 'Status'


@admin.register(ManualPaymentSubmission)
class ManualPaymentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'mpesa_transaction_code', 'amount', 'payment_status_badge', 'created_at', 'reviewed_at')
    list_filter = ('status', 'created_at')
    search_fields = ('phone_number', 'mpesa_transaction_code', 'user__email', 'user__first_name')
    readonly_fields = ('created_at', 'reviewed_at')
    actions = ['approve_payments', 'reject_payments']

    def save_model(self, request, obj, form, change):
        from django.utils import timezone

        if obj.status == ManualPaymentSubmission.Status.APPROVED:
            obj.reviewed_by = request.user
            obj.reviewed_at = obj.reviewed_at or timezone.now()
        elif obj.status == ManualPaymentSubmission.Status.REJECTED:
            obj.reviewed_by = request.user
            obj.reviewed_at = obj.reviewed_at or timezone.now()

        super().save_model(request, obj, form, change)

        if obj.status == ManualPaymentSubmission.Status.APPROVED:
            user = obj.user
            user.verification_status = 'verified'
            user.is_verified = True
            user.status = 'approved'
            user.is_active = True
            user.payment_submitted_at = None
            user.save(update_fields=['verification_status', 'is_verified', 'status', 'is_active', 'payment_submitted_at'])
        elif obj.status == ManualPaymentSubmission.Status.REJECTED:
            user = obj.user
            user.verification_status = 'rejected'
            user.is_verified = False
            user.status = 'rejected'
            user.save(update_fields=['verification_status', 'is_verified', 'status'])

    def payment_status_badge(self, obj):
        colors = {
            'pending_verification': '#3498db',
            'approved': '#28a745',
            'rejected': '#dc3545',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: white; background-color: {}; padding: 3px 10px; border-radius: 10px; font-weight: bold; font-size: 11px;">{}</span>',
            color,
            obj.get_status_display()
        )
    payment_status_badge.short_description = 'Status'

    @admin.action(description="Approve selected payments & verify users")
    def approve_payments(self, request, queryset):
        from django.utils import timezone
        approved = 0
        for submission in queryset.filter(status='pending_verification'):
            submission.status = 'approved'
            submission.reviewed_by = request.user
            submission.reviewed_at = timezone.now()
            submission.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])
            submission.user.verification_status = 'verified'
            submission.user.is_verified = True
            submission.user.status = 'approved'
            submission.user.is_active = True
            submission.user.payment_submitted_at = None
            submission.user.save(update_fields=['verification_status', 'is_verified', 'status', 'is_active', 'payment_submitted_at'])
            approved += 1
        self.message_user(request, f"Approved {approved} payments and verified their users.", messages.SUCCESS)

    @admin.action(description="Reject selected payments")
    def reject_payments(self, request, queryset):
        from django.utils import timezone
        rejected = 0
        for submission in queryset.filter(status='pending_verification'):
            submission.status = 'rejected'
            submission.reviewed_by = request.user
            submission.reviewed_at = timezone.now()
            submission.save(update_fields=['status', 'reviewed_by', 'reviewed_at'])
            submission.user.verification_status = 'rejected'
            submission.user.is_verified = False
            submission.user.status = 'rejected'
            submission.user.save(update_fields=['verification_status', 'is_verified', 'status'])
            rejected += 1
        self.message_user(request, f"Rejected {rejected} payments.", messages.WARNING)
