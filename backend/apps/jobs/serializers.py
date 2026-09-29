from rest_framework import serializers
from .models import JobDescription
from apps.resumes.services.skill_engine import extract_skills_from_text

class JobDescriptionSerializer(serializers.ModelSerializer):
    auto_extracted_skills = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = JobDescription
        fields = (
            'id',
            'title',
            'company',
            'location',
            'employment_type',
            'description',
            'required_skills',
            'preferred_skills',
            'job_url',
            'salary_range',
            'auto_extracted_skills',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_auto_extracted_skills(self, obj):
        return extract_skills_from_text(obj.description)

    def create(self, validated_data):
        # If user didn't specify required_skills, auto-populate from description
        if not validated_data.get('required_skills'):
            auto_skills = extract_skills_from_text(validated_data.get('description', ''))
            validated_data['required_skills'] = auto_skills
        return super().create(validated_data)
