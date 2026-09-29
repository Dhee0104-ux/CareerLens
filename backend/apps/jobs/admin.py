from django.contrib import admin
from .models import JobDescription

@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'owner', 'employment_type', 'created_at')
    search_fields = ('title', 'company', 'owner__username')
    list_filter = ('employment_type', 'created_at')
