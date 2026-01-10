from django.urls import path
from .views import RegisterWorkerView, RegisterEmployerView, HelperListView

urlpatterns = [
    # Registration Endpoints
    path('register/worker/', RegisterWorkerView.as_view(), name='register-worker'),
    path('register/employer/', RegisterEmployerView.as_view(), name='register-employer'),
    path('workers/', HelperListView.as_view(), name='worker-list'),
]