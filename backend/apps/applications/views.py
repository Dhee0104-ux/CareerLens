from rest_framework import generics, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import JobApplication
from .serializers import JobApplicationSerializer

class JobApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        queryset = JobApplication.objects.filter(owner=self.request.user)

        # Status filter
        status_param = self.request.query_params.get('status')
        if status_param and status_param.lower() != 'all':
            queryset = queryset.filter(status=status_param.lower())

        # Search query (company, role, location, notes)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(company__icontains=search) |
                Q(role_title__icontains=search) |
                Q(location__icontains=search) |
                Q(notes__icontains=search)
            )

        # Sorting
        ordering = self.request.query_params.get('ordering', '-applied_date')
        if ordering in ['applied_date', '-applied_date', 'company', '-company', 'created_at', '-created_at']:
            queryset = queryset.order_by(ordering)

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class JobApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobApplicationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return JobApplication.objects.filter(owner=self.request.user)


class JobApplicationStatusUpdateView(APIView):
    """
    Quick status update endpoint (useful for Kanban drag-and-drop)
    """
    permission_classes = (permissions.IsAuthenticated,)

    def patch(self, request, pk, *args, **kwargs):
        try:
            application = JobApplication.objects.get(pk=pk, owner=request.user)
        except JobApplication.DoesNotExist:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in JobApplication.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f"Invalid status '{new_status}'. Allowed: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        application.status = new_status
        application.save()
        serializer = JobApplicationSerializer(application, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
