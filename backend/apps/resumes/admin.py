from django.contrib import admin
from .models import Resume, SkillAnalysis

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('original_filename', 'owner', 'status', 'page_count', 'created_at')
    search_fields = ('original_filename', 'owner__username')
    list_filter = ('status', 'created_at')

@admin.register(SkillAnalysis)
class SkillAnalysisAdmin(admin.ModelAdmin):
    list_display = ('job_title', 'company_name', 'resume_title', 'owner', 'match_score', 'created_at')
    search_fields = ('job_title', 'company_name', 'owner__username')
    list_filter = ('created_at',)
