"""
URL configuration for the main project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # 1. The Default Django Admin (Useful as a fallback/backup)
    path('root/admin/', admin.site.urls),

    # 2. Your Custom API Endpoints (Login, Register, Admin Management)
    # This points to the users/urls.py we configured in the previous step
    path('api/', include('users.urls')),

]

# 3. Serve Media & Static files during development
# This allows you to view uploaded ID photos via URL when DEBUG is True
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
