from django.urls import path
from .views import SkillAnalysisListCreateView, SkillAnalysisDetailView

urlpatterns = [
    path('', SkillAnalysisListCreateView.as_view(), name='analysis_list_create'),
    path('<int:pk>/', SkillAnalysisDetailView.as_view(), name='analysis_detail'),
]
