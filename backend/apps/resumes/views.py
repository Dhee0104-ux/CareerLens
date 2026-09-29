from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Resume, SkillAnalysis
from .serializers import (
    ResumeSerializer,
    SkillAnalysisSerializer,
    CreateSkillAnalysisSerializer
)
from apps.resumes.services.skill_engine import extract_text_from_pdf, extract_skills_from_text

class ResumeListCreateView(generics.ListCreateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        return Resume.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ResumeDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ResumeSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return Resume.objects.filter(owner=self.request.user)


class ResumeReprocessView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk, *args, **kwargs):
        try:
            resume = Resume.objects.get(pk=pk, owner=request.user)
        except Resume.DoesNotExist:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not resume.file:
            return Response({'error': 'No file associated with this resume.'}, status=status.HTTP_400_BAD_REQUEST)

        # Reprocess PDF text and skills
        extraction_result = extract_text_from_pdf(resume.file)
        if extraction_result['success'] and extraction_result['status'] == 'success':
            resume.extracted_text = extraction_result['text']
            resume.page_count = extraction_result['page_count']
            resume.extracted_skills = extract_skills_from_text(resume.extracted_text)
            resume.status = 'completed'
            resume.status_message = extraction_result['message']
        else:
            resume.extracted_text = extraction_result.get('text', '')
            resume.page_count = extraction_result.get('page_count', 1)
            resume.extracted_skills = []
            resume.status = extraction_result.get('status', 'failed')
            resume.status_message = extraction_result.get('message', 'Reprocessing failed.')

        resume.save()
        serializer = ResumeSerializer(resume)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SkillAnalysisListCreateView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateSkillAnalysisSerializer
        return SkillAnalysisSerializer

    def get_queryset(self):
        return SkillAnalysis.objects.filter(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = CreateSkillAnalysisSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        analysis = serializer.save()
        output_serializer = SkillAnalysisSerializer(analysis)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)


class SkillAnalysisDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = SkillAnalysisSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return SkillAnalysis.objects.filter(owner=self.request.user)
