from django.urls import path
from .views import JobDescriptionListCreateView, JobDescriptionDetailView, JobSkillExtractPreviewView

urlpatterns = [
    path('', JobDescriptionListCreateView.as_view(), name='job_list_create'),
    path('extract-preview/', JobSkillExtractPreviewView.as_view(), name='job_extract_preview'),
    path('<int:pk>/', JobDescriptionDetailView.as_view(), name='job_detail'),
]
