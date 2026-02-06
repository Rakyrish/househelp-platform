from rest_framework.authentication import TokenAuthentication
from rest_framework import exceptions
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        """
        By returning None, we bypass the CSRF check entirely 
        for requests using this authentication class.
        """
        return
    
class ExpiringTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, key):
        model = self.get_model()
        try:
            token = model.objects.select_related('user').get(key=key)
        except model.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token.')

        if not token.user.is_active:
            raise exceptions.AuthenticationFailed('User inactive or deleted.')

        # We pull the limit from settings. Defaulting to 600 seconds (10 mins) if not found
        # You set this in settings.py as TOKEN_EXPIRED_AFTER_SECONDS
        expiry_limit = getattr(settings, 'TOKEN_EXPIRED_AFTER_SECONDS', 3600)
        
        # Check if the token is older than our limit
        is_expired = token.created < timezone.now() - timedelta(seconds=expiry_limit)
        
        if is_expired:
            token.delete()  # Remove from DB
            raise exceptions.AuthenticationFailed('Token has expired.')

        return (token.user, token)