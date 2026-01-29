from .auth import (
    RegisterWorkerView, RegisterEmployerView, 
    WorkerLoginView, EmployerLoginView, AdminLoginView, PasswordResetConfirmView,PasswordResetRequestView,SoftDeleteUserView,
    PermanentDeleteUserView, DeactivateMyAccountView
)
from .admin import (
    AdminUserManagementViewSet, AdminHiringRegistryViewSet, 
    CategoryViewSet, PlatformSettingsView,AdminPermanentDeleteUserView,AdminUserPasswordResetView, ContactUsView
)
from .workers import WorkerDashboardViewSet, WorkerBookingViewSet
from .employers import EmployerDashboardViewSet, WorkerViewSet