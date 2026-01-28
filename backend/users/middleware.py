from django.http import JsonResponse
from .models import PlatformSetting

class MaintenanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. Always allow the settings check and Django admin
        if request.path.startswith('/api/admin/platform-settings/') or request.path.startswith('/admin/'):
            return self.get_response(request)

        settings = PlatformSetting.objects.first()
        if settings and settings.maintenance_mode:
            # 2. Check if the request has the Admin Token
            # DRF uses the 'Authorization' header
            auth_header = request.headers.get('Authorization', '')
            
            # If the user is authenticated via Token and is staff/admin
            if request.user.is_authenticated and request.user.is_staff:
                return self.get_response(request)
            
            # 3. Block everyone else
            return JsonResponse({
                "error": "maintenance_active",
                "message": settings.broadcast_message or "We are updating our systems."
            }, status=503)

        return self.get_response(request)