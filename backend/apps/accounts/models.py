from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    headline = models.CharField(max_length=255, blank=True, default='')
    target_role = models.CharField(max_length=255, blank=True, default='')
    experience_level = models.CharField(
        max_length=50, 
        choices=[
            ('entry', 'Entry Level / Student'),
            ('mid', 'Mid Level (2-5 yrs)'),
            ('senior', 'Senior Level (5+ yrs)'),
            ('lead', 'Lead / Principal / Manager')
        ],
        default='entry'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
