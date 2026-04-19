from django.http import JsonResponse
from .models import PlatformSetting

class MaintenanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Always allow the settings check and Django admin
        if request.path.startswith('/api/admin/platform-settings/') or request.path.startswith('/admin/'):
            return self.get_response(request)
        exempt_paths = ['/api/login/', '/api/login/admin'] 
        
        if request.path in exempt_paths:
            return self.get_response(request)

        settings_obj = PlatformSetting.objects.first()
        if settings_obj and settings_obj.maintenance_mode:
            # If the user is authenticated via Token and is staff/admin
            if hasattr(request, 'user') and request.user.is_authenticated and request.user.is_staff:
                return self.get_response(request)
            
            # 3. Block everyone else
            return JsonResponse({
                "error": "maintenance_active",
                "message": settings_obj.broadcast_message or "We are updating our systems."
            }, status=503)

        return self.get_response(request)


from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class TemporaryAccessAutoExpiryMiddleware:
    """
    Middleware that checks for 'under_review' auto-expiry on every request
    for authenticated workers.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated and request.user.role == 'worker':
            request.user = User.objects.get(pk=request.user.pk)

            if request.user.verification_status == 'verified':
                return self.get_response(request)

            if request.user.verification_status == 'under_review':
                if not request.user.has_timed_access:
                    from rest_framework.authtoken.models import Token
                    Token.objects.filter(user=request.user).delete()
                    return JsonResponse({
                        "error": "Session expired",
                        "detail": "Your session has expired. Account still under review.",
                        "code": "temporary_access_expired"
                    }, status=401)
                    
        return self.get_response(request)
