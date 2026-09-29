import os
import uuid
from django.db import models
from django.contrib.auth.models import User

def resume_upload_path(instance, filename):
    # Store with random uuid prefix to prevent collision and safe naming
    ext = os.path.splitext(filename)[1].lower()
    safe_name = f"{uuid.uuid4().hex}{ext}"
    return f"resumes/user_{instance.owner_id}/{safe_name}"

class Resume(models.Model):
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('empty', 'No Text Found (Scanned/Empty)'),
        ('encrypted', 'Encrypted / Password Protected'),
        ('failed', 'Extraction Failed'),
    ]

    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    original_filename = models.CharField(max_length=255)
    file = models.FileField(upload_to=resume_upload_path)
    file_size = models.PositiveIntegerField(default=0, help_text="Size in bytes")
    extracted_text = models.TextField(blank=True, default='')
    extracted_skills = models.JSONField(default=list, blank=True)
    page_count = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    status_message = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.original_filename} ({self.owner.username})"


class SkillAnalysis(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skill_analyses')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True, related_name='analyses')
    job = models.ForeignKey('jobs.JobDescription', on_delete=models.SET_NULL, null=True, blank=True, related_name='analyses')

    # Cached snapshots so historical analyses remain readable even if resume/job is modified or deleted
    resume_title = models.CharField(max_length=255, blank=True, default='')
    job_title = models.CharField(max_length=255, blank=True, default='')
    company_name = models.CharField(max_length=255, blank=True, default='')

    match_score = models.FloatField(null=True, blank=True, help_text="Percentage of required skills matched")
    preferred_match_score = models.FloatField(null=True, blank=True)
    text_similarity_score = models.FloatField(default=0.0, help_text="TF-IDF Cosine similarity percentage")
    score_explanation = models.CharField(max_length=500, blank=True, default='')

    matched_skills = models.JSONField(default=list, blank=True)
    missing_skills = models.JSONField(default=list, blank=True)
    additional_skills = models.JSONField(default=list, blank=True)
    recommendations = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Analysis: {self.resume_title} vs {self.job_title} ({self.match_score}%)"
