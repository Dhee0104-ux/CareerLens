from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from apps.applications.models import JobApplication

class ApplicationAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='tester', email='t@test.com', password='Password123!')
        self.client.force_authenticate(user=self.user)

    def test_application_crud_and_status_update(self):
        # Create
        payload = {
            'company': 'Google',
            'role_title': 'Software Engineer II',
            'status': 'applied',
            'location': 'Mountain View, CA',
            'notes': 'Applied via referral.'
        }
        create_res = self.client.post('/api/v1/applications/', payload, format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        app_id = create_res.data['id']
        self.assertEqual(create_res.data['status'], 'applied')

        # Status Patch
        patch_res = self.client.patch(f'/api/v1/applications/{app_id}/status/', {'status': 'interview'}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data['status'], 'interview')

        # List with filter
        list_res = self.client.get('/api/v1/applications/?status=interview')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(list_res.data['count'], 1)
