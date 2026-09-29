from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.jobs.models import JobDescription

class JobAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='johnd', email='jd@test.com', password='Password123!')
        self.user2 = User.objects.create_user(username='marys', email='ms@test.com', password='Password123!')
        self.client.force_authenticate(user=self.user1)

    def test_create_and_list_job_descriptions(self):
        payload = {
            'title': 'Frontend Developer',
            'company': 'Tech Corp',
            'location': 'Remote',
            'employment_type': 'full_time',
            'description': 'We need a Frontend Developer proficient in React, TypeScript, and Tailwind CSS.',
            'required_skills': ['React', 'TypeScript', 'Tailwind CSS'],
            'preferred_skills': ['Next.js', 'GraphQL']
        }
        create_res = self.client.post('/api/v1/jobs/', payload, format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_res.data['title'], 'Frontend Developer')
        self.assertEqual(len(create_res.data['required_skills']), 3)

        # List jobs
        list_res = self.client.get('/api/v1/jobs/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(list_res.data['count'], 1)

    def test_job_skill_extract_preview(self):
        sample_text = "Senior Python engineer with AWS, Docker, Kubernetes and PostgreSQL background."
        res = self.client.post('/api/v1/jobs/extract-preview/', {'text': sample_text}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        skills = res.data['skills']
        self.assertIn('Python', skills)
        self.assertIn('AWS', skills)
        self.assertIn('Docker', skills)
        self.assertIn('Kubernetes', skills)
        self.assertIn('PostgreSQL', skills)

    def test_job_user_isolation(self):
        job = JobDescription.objects.create(
            owner=self.user1,
            title="DevOps Engineer",
            company="Cloud Inc",
            description="Docker, K8s, Terraform"
        )
        # User 2 cannot access
        self.client.force_authenticate(user=self.user2)
        res = self.client.get(f'/api/v1/jobs/{job.id}/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
