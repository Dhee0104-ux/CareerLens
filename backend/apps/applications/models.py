from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('wishlist', 'Wishlist'),
        ('applied', 'Applied'),
        ('assessment', 'Assessment / Coding Test'),
        ('interview', 'Interview'),
        ('offer', 'Offer Received'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    job = models.ForeignKey(
        'jobs.JobDescription', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='applications'
    )
    company = models.CharField(max_length=255)
    role_title = models.CharField(max_length=255)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='applied')
    applied_date = models.DateField(default=timezone.localdate)
    interview_date = models.DateTimeField(null=True, blank=True)
    offer_deadline = models.DateField(null=True, blank=True)
    salary_offered = models.CharField(max_length=100, blank=True, default='')
    location = models.CharField(max_length=255, blank=True, default='')
    job_url = models.URLField(max_length=500, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_date', '-created_at']

    def __str__(self):
        return f"{self.role_title} @ {self.company} [{self.get_status_display()}] ({self.owner.username})"
