from django.urls import path
from .views import (
    JobApplicationListCreateView,
    JobApplicationDetailView,
    JobApplicationStatusUpdateView
)

urlpatterns = [
    path('', JobApplicationListCreateView.as_view(), name='application_list_create'),
    path('<int:pk>/', JobApplicationDetailView.as_view(), name='application_detail'),
    path('<int:pk>/status/', JobApplicationStatusUpdateView.as_view(), name='application_status_update'),
]
