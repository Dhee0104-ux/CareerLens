from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

class AccountsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.me_url = '/api/v1/auth/me/'

    def test_user_registration_success(self):
        payload = {
            'username': 'john_doe',
            'email': 'john@example.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertEqual(response.data['user']['username'], 'john_doe')
        self.assertTrue(User.objects.filter(username='john_doe').exists())

    def test_registration_password_mismatch(self):
        payload = {
            'username': 'jane_doe',
            'email': 'jane@example.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'DifferentPassword123!',
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_and_access_protected_me_endpoint(self):
        # Create user
        User.objects.create_user(username='alice', email='alice@example.com', password='Password123!')
        
        # Login
        login_res = self.client.post(self.login_url, {
            'username': 'alice',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res.data)
        token = login_res.data['access']

        # Access Me without token -> 401
        self.client.credentials()
        unauth_res = self.client.get(self.me_url)
        self.assertEqual(unauth_res.status_code, status.HTTP_401_UNAUTHORIZED)

        # Access Me with token -> 200
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        auth_res = self.client.get(self.me_url)
        self.assertEqual(auth_res.status_code, status.HTTP_200_OK)
        self.assertEqual(auth_res.data['username'], 'alice')
