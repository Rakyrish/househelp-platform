from django_filters import rest_framework as filters
from .models import Worker
from datetime import date

class WorkerFilter(filters.FilterSet):
    min_salary = filters.NumberFilter(field_name="expected_salary", lookup_expr='gte')
    max_salary = filters.NumberFilter(field_name="expected_salary", lookup_expr='lte')

    experience = filters.NumberFilter(field_name="experience", lookup_expr='gte')

    min_age = filters.NumberFilter(method='filter_min_age')
    max_age = filters.NumberFilter(method='filter_max_age')

    class Meta:
        model = Worker
        fields = [
            'worker_type',
            'location',
            'is_verified',
            'min_salary',
            'max_salary',
            'experience',
            'min_age',
            'max_age',
        ]

    def filter_min_age(self, queryset, name, value):
        today = date.today()
        cutoff_date = date(today.year - int(value), today.month, today.day)
        return queryset.filter(date_of_birth__lte=cutoff_date)

    def filter_max_age(self, queryset, name, value):
        today = date.today()
        cutoff_date = date(today.year - int(value), today.month, today.day)
        return queryset.filter(date_of_birth__gte=cutoff_date)
