from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import JobDescription
from .serializers import JobDescriptionSerializer
from apps.resumes.services.skill_engine import extract_skills_from_text

class JobDescriptionListCreateView(generics.ListCreateAPIView):
    serializer_class = JobDescriptionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = JobDescription.objects.filter(owner=self.request.user)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search) | queryset.filter(company__icontains=search)
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class JobDescriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobDescriptionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return JobDescription.objects.filter(owner=self.request.user)

class JobSkillExtractPreviewView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        text = request.data.get('text', '')
        if not text:
            return Response({'skills': [], 'message': 'Please provide text to extract skills.'}, status=status.HTTP_200_OK)
        
        extracted = extract_skills_from_text(text)
        return Response({
            'skills': extracted,
            'count': len(extracted),
            'message': f"Detected {len(extracted)} skill(s) in the job description."
        }, status=status.HTTP_200_OK)
