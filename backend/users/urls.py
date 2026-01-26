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
    WorkerViewSet,           # New: Used for the directory and hiring
    WorkerBookingViewSet,    # New: Used for workers to accept/decline
    EmployerDashboardViewSet
)

router = DefaultRouter()

# Admin Management
router.register(r'admin/manage-users', AdminUserManagementViewSet, basename='admin-manage-users')

# Worker Dashboard (Profile, Status, Password)
router.register(r'worker/dashboard', WorkerDashboardViewSet, basename='worker-dashboard')

# Worker Invites (Accepting/Declining jobs)
router.register(r'worker-requests', WorkerBookingViewSet, basename='worker-requests')

# Employer Dashboard (Stats and My Requests)
router.register(r'employer-dashboard', EmployerDashboardViewSet, basename='employer-dash')

# Worker Directory (Searching and Hiring)
router.register(r'workers', WorkerViewSet, basename='workers-directory')

urlpatterns = [
    # Auth Endpoints
    path('register/worker/', RegisterWorkerView.as_view(), name='register-worker'),
    path('register/employer/', RegisterEmployerView.as_view(), name='register-employer'),
    path('login/worker/', WorkerLoginView.as_view(), name='login-worker'),
    path('login/employer/', EmployerLoginView.as_view(), name='login-employer'),
    path('login/admin/', AdminLoginView.as_view(), name='login-admin'),

    # Include all router-generated URLs
    path('', include(router.urls)),
]