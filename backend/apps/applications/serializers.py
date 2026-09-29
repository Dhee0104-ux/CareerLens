from rest_framework import serializers
from .models import JobApplication
from apps.jobs.serializers import JobDescriptionSerializer

class JobApplicationSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    job_details = JobDescriptionSerializer(source='job', read_only=True)

    class Meta:
        model = JobApplication
        fields = (
            'id',
            'job',
            'job_details',
            'company',
            'role_title',
            'status',
            'status_display',
            'applied_date',
            'interview_date',
            'offer_deadline',
            'salary_offered',
            'location',
            'job_url',
            'notes',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'status_display', 'job_details', 'created_at', 'updated_at')

    def validate(self, attrs):
        user = self.context['request'].user
        job = attrs.get('job')
        if job and job.owner != user:
            raise serializers.ValidationError({"job": "The selected job description does not belong to you."})
        return attrs
