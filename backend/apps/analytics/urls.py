from django.urls import path
from .views import (
    AnalyticsOverviewView,
    AnalyticsApplicationsView,
    AnalyticsSkillsView,
    SeedDemoDataView,
    ClearDemoDataView,
    LiveEventsFeedView,
)

urlpatterns = [
    path('overview/', AnalyticsOverviewView.as_view(), name='analytics_overview'),
    path('applications/', AnalyticsApplicationsView.as_view(), name='analytics_applications'),
    path('skills/', AnalyticsSkillsView.as_view(), name='analytics_skills'),
    path('seed-demo-data/', SeedDemoDataView.as_view(), name='analytics_seed_demo'),
    path('clear-demo-data/', ClearDemoDataView.as_view(), name='analytics_clear_demo'),
    path('live-events/', LiveEventsFeedView.as_view(), name='analytics_live_events'),
]

