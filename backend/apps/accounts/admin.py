from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'target_role', 'experience_level', 'created_at')
    search_fields = ('user__username', 'user__email', 'target_role')
