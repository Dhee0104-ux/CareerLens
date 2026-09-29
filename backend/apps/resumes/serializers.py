from rest_framework import serializers
from django.conf import settings
from .models import Resume, SkillAnalysis
from apps.jobs.models import JobDescription
from apps.resumes.services.skill_engine import (
    extract_text_from_pdf,
    extract_skills_from_text,
    analyze_skill_gap
)

class ResumeSerializer(serializers.ModelSerializer):
    skill_count = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = (
            'id',
            'original_filename',
            'file',
            'file_size',
            'extracted_text',
            'extracted_skills',
            'skill_count',
            'page_count',
            'status',
            'status_message',
            'created_at',
            'updated_at'
        )
        read_only_fields = (
            'id',
            'original_filename',
            'file_size',
            'extracted_text',
            'extracted_skills',
            'skill_count',
            'page_count',
            'status',
            'status_message',
            'created_at',
            'updated_at'
        )

    def get_skill_count(self, obj):
        return len(obj.extracted_skills) if isinstance(obj.extracted_skills, list) else 0

    def validate_file(self, value):
        # 1. File extension validation
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError("Only PDF files are supported. Please upload a valid .pdf file.")

        # 2. File size validation
        max_size_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if value.size > max_size_bytes:
            raise serializers.ValidationError(
                f"File size exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit. Please upload a smaller file."
            )

        return value

    def create(self, validated_data):
        uploaded_file = validated_data['file']
        owner = validated_data['owner']

        # Store original filename and size
        original_filename = uploaded_file.name
        file_size = uploaded_file.size

        # Extract text via PyMuPDF safely
        extraction_result = extract_text_from_pdf(uploaded_file)
        
        extracted_text = extraction_result['text']
        page_count = extraction_result['page_count']
        status_val = extraction_result['status']
        status_msg = extraction_result['message']

        if extraction_result['success'] and status_val == 'success':
            status_val = 'completed'
            extracted_skills = extract_skills_from_text(extracted_text)
        else:
            extracted_skills = []

        resume = Resume.objects.create(
            owner=owner,
            file=uploaded_file,
            original_filename=original_filename,
            file_size=file_size,
            extracted_text=extracted_text,
            extracted_skills=extracted_skills,
            page_count=page_count,
            status=status_val,
            status_message=status_msg
        )
        return resume


class SkillAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillAnalysis
        fields = (
            'id',
            'resume',
            'job',
            'resume_title',
            'job_title',
            'company_name',
            'match_score',
            'preferred_match_score',
            'text_similarity_score',
            'score_explanation',
            'matched_skills',
            'missing_skills',
            'additional_skills',
            'recommendations',
            'created_at'
        )
        read_only_fields = fields


class CreateSkillAnalysisSerializer(serializers.Serializer):
    resume_id = serializers.IntegerField(required=True)
    job_id = serializers.IntegerField(required=True)

    def validate(self, attrs):
        user = self.context['request'].user
        
        # Verify resume ownership
        try:
            resume = Resume.objects.get(id=attrs['resume_id'], owner=user)
        except Resume.DoesNotExist:
            raise serializers.ValidationError({"resume_id": "Resume not found or does not belong to you."})

        # Verify job ownership
        try:
            job = JobDescription.objects.get(id=attrs['job_id'], owner=user)
        except JobDescription.DoesNotExist:
            raise serializers.ValidationError({"job_id": "Job description not found or does not belong to you."})

        attrs['resume_obj'] = resume
        attrs['job_obj'] = job
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        resume = validated_data['resume_obj']
        job = validated_data['job_obj']

        # Run skill gap analysis engine
        analysis_result = analyze_skill_gap(
            resume_skills=resume.extracted_skills,
            job_required_skills=job.required_skills,
            job_preferred_skills=job.preferred_skills,
            resume_text=resume.extracted_text,
            job_text=job.description
        )

        analysis = SkillAnalysis.objects.create(
            owner=user,
            resume=resume,
            job=job,
            resume_title=resume.original_filename,
            job_title=job.title,
            company_name=job.company,
            match_score=analysis_result['match_score'],
            preferred_match_score=analysis_result['preferred_match_score'],
            text_similarity_score=analysis_result['text_similarity_score'],
            score_explanation=analysis_result['score_explanation'],
            matched_skills=analysis_result['matched_skills'],
            missing_skills=analysis_result['missing_required_skills'],
            additional_skills=analysis_result['additional_skills'],
            recommendations=analysis_result['recommendations']
        )
        return analysis
