from django.contrib import admin
from .models import JobApplication

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('role_title', 'company', 'owner', 'status', 'applied_date', 'created_at')
    search_fields = ('role_title', 'company', 'owner__username', 'location')
    list_filter = ('status', 'applied_date')
