from django.urls import path
from .views import ResumeListCreateView, ResumeDetailView, ResumeReprocessView

urlpatterns = [
    path('', ResumeListCreateView.as_view(), name='resume_list_create'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume_detail'),
    path('<int:pk>/reprocess/', ResumeReprocessView.as_view(), name='resume_reprocess'),
]
