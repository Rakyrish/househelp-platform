from django.urls import path
from .views import RegisterWorkerView, RegisterEmployerView, HelperListView, WorkerLoginView, EmployerLoginView

urlpatterns = [
    # Registration Endpoints
    path('register/worker/', RegisterWorkerView.as_view(), name='register-worker'),
    path('register/employer/', RegisterEmployerView.as_view(), name='register-employer'),
    path('workers/', HelperListView.as_view(), name='worker-list'),
    # Login Endpoints
    path('login/worker/', WorkerLoginView.as_view(), name='login-worker'),
    path('login/employer/', EmployerLoginView.as_view(), name='login-employer'),

]