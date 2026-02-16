from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminLoginView, 
    RegisterWorkerView, 
    RegisterEmployerView, 
    WorkerLoginView, 
    EmployerLoginView,
    AdminUserManagementViewSet,
    WorkerDashboardViewSet,
    WorkerViewSet,           
    WorkerBookingViewSet,    
    EmployerDashboardViewSet
)

from users import views 

router = DefaultRouter()

# Admin routes
router.register(r'admin/manage-users', views.AdminUserManagementViewSet, basename='admin-users')
router.register(r'admin/manage-hires', views.AdminHiringRegistryViewSet, basename='admin-hires')
router.register(r'admin/categories', views.CategoryViewSet, basename='admin-categories')

# Business routes
router.register(r'workers', views.WorkerViewSet, basename='workers-directory')
# ... rest of your routes

# Admin Management
# router.register(r'admin/manage-users', AdminUserManagementViewSet, basename='admin-manage-users')

# Worker Dashboard (Profile, Status, Password)
router.register(r'worker/dashboard', views.WorkerDashboardViewSet, basename='worker-dashboard')

# Worker Invites (Accepting/Declining jobs)
router.register(r'worker-requests', views.WorkerBookingViewSet, basename='worker-requests')

# Employer Dashboard (Stats and My Requests)
router.register(r'employer-dashboard',  views.EmployerDashboardViewSet, basename='employer-dash')

# Worker Directory (Searching and Hiring)
# router.register(r'workers', WorkerViewSet, basename='workers-directory')

urlpatterns = [
    # Auth Endpoints
    path('register/worker/', RegisterWorkerView.as_view(), name='register-worker'),
    path('register/employer/', RegisterEmployerView.as_view(), name='register-employer'),
    path('login/worker/', WorkerLoginView.as_view(), name='login-worker'),
    path('login/employer/', EmployerLoginView.as_view(), name='login-employer'),
    path('login/admin/', AdminLoginView.as_view(), name='login-admin'),
    path('admin-panel/platform-settings/', views.PlatformSettingsView.as_view(), name='admin-platform'),
    path('password-reset-request/', views.PasswordResetRequestView.as_view()),
    path('password-reset-confirm/<str:uidb64>/<str:token>/', views.PasswordResetConfirmView.as_view()),
    path("<int:user_id>/soft-delete/", views.SoftDeleteUserView.as_view()),
    path("<int:user_id>/permanent-delete/", views.PermanentDeleteUserView.as_view()),
    path("account/deactivate/", views.DeactivateMyAccountView.as_view()),
    # Use 'admin/users/' to match your frontend XHR request
    path('admin/users/<int:user_id>/reset-password/', views.AdminUserPasswordResetView.as_view(), name='admin-password-reset'),
    path('admin/manage-users/<int:user_id>/permanent_erase/', views.AdminPermanentDeleteUserView.as_view(), name='admin-permanent-erase'),
    path('contact-us/', views.ContactUsView.as_view(), name='contact'),
    path('set-csrf/', views.set_csrf_token, name='set-csrf'),
   
    # Include all router-generated URLs
    path('', include(router.urls)),
]