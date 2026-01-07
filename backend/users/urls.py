from django.urls import path
from .views import RegisterWorkerView, HelperListView, RegisterEmployerView

urlpatterns = [
    path('register/worker', RegisterWorkerView.as_view(), name='register'),
    path('helpers/', HelperListView.as_view(), name='helper-list'),
    path('register/employer', RegisterEmployerView.as_view(), name='register-employer'),
]