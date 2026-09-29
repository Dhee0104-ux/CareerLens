from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.applications.models import JobApplication
from apps.resumes.models import Resume, SkillAnalysis

class AnalyticsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='analyzeme', email='am@test.com', password='Password123!')
        self.client.force_authenticate(user=self.user)

    def test_analytics_overview_and_distribution(self):
        # Create applications with various statuses
        JobApplication.objects.create(owner=self.user, company='Company A', role_title='Dev', status='applied')
        JobApplication.objects.create(owner=self.user, company='Company B', role_title='Dev', status='interview')
        JobApplication.objects.create(owner=self.user, company='Company C', role_title='Dev', status='offer')
        JobApplication.objects.create(owner=self.user, company='Company D', role_title='Dev', status='rejected')

        # Create analyses
        SkillAnalysis.objects.create(
            owner=self.user,
            job_title='Backend Dev',
            company_name='Company A',
            match_score=75.0,
            matched_skills=['Python', 'Django'],
            missing_skills=['Docker', 'AWS']
        )
        SkillAnalysis.objects.create(
            owner=self.user,
            job_title='Fullstack Dev',
            company_name='Company B',
            match_score=50.0,
            matched_skills=['Python', 'React'],
            missing_skills=['AWS', 'Kubernetes']
        )

        # Overview
        overview_res = self.client.get('/api/v1/analytics/overview/')
        self.assertEqual(overview_res.status_code, status.HTTP_200_OK)
        self.assertEqual(overview_res.data['total_applications'], 4)
        self.assertEqual(overview_res.data['interview_count'], 1)
        self.assertEqual(overview_res.data['offer_count'], 1)
        self.assertEqual(overview_res.data['rejection_count'], 1)
        self.assertEqual(overview_res.data['average_match_score'], 62.5)

        # Applications Breakdown
        apps_res = self.client.get('/api/v1/analytics/applications/')
        self.assertEqual(apps_res.status_code, status.HTTP_200_OK)
        self.assertEqual(apps_res.data['total_count'], 4)

        # Skills Analytics
        skills_res = self.client.get('/api/v1/analytics/skills/')
        self.assertEqual(skills_res.status_code, status.HTTP_200_OK)
        top_missing = {item['skill']: item['frequency'] for item in skills_res.data['top_missing_skills']}
        self.assertEqual(top_missing.get('AWS'), 2)
