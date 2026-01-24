from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminLoginView, 
    RegisterWorkerView, 
    RegisterEmployerView, 
    HelperListView, 
    WorkerLoginView, 
    EmployerLoginView,
    AdminUserManagementViewSet  
)

# 1. Setup the Router for Admin Management
# This handles: 
# GET /api/admin/manage-users/ (List all)
# GET /api/admin/manage-users/{id}/ (Retrieve detail)
# POST /api/admin/manage-users/{id}/approve_worker/ (Custom Action)
router = DefaultRouter()
router.register(r'admin/manage-users', AdminUserManagementViewSet, basename='admin-manage-users')

urlpatterns = [
    # --- Public & Authentication Endpoints ---
    path('register/worker/', RegisterWorkerView.as_view(), name='register-worker'),
    path('register/employer/', RegisterEmployerView.as_view(), name='register-employer'),
    path('workers/', HelperListView.as_view(), name='worker-list'),
    
    # --- Login Endpoints ---
    path('login/worker/', WorkerLoginView.as_view(), name='login-worker'),
    path('login/employer/', EmployerLoginView.as_view(), name='login-employer'),
    path('login/admin/', AdminLoginView.as_view(), name='login-admin'),

    # --- Admin Management Endpoints (ViewSets) ---
    # We use include(router.urls) to pull in all the management logic at once
    path('', include(router.urls)),
]