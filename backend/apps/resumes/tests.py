import io
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
import pymupdf

from apps.resumes.models import Resume, SkillAnalysis
from apps.jobs.models import JobDescription
from apps.resumes.services.skill_engine import (
    extract_skills_from_text,
    analyze_skill_gap,
    extract_text_from_pdf,
    calculate_text_similarity,
    get_learning_recommendation_for_skill
)

class SkillEngineUnitTest(TestCase):
    def test_skill_extraction_and_alias_normalization(self):
        text = """
        Experienced Full Stack Engineer skilled in Python, JS, ReactJS, TS, Postgres, Docker, K8s, and AWS.
        Familiar with ML, NLP, and CI/CD pipelines.
        """
        skills = extract_skills_from_text(text)
        expected = [
            'AWS', 'CI/CD', 'Docker', 'JavaScript', 'Kubernetes',
            'Machine Learning', 'NLP', 'PostgreSQL', 'Python', 'React', 'TypeScript'
        ]
        for exp in expected:
            self.assertIn(exp, skills)

    def test_token_boundary_accuracy(self):
        # Ensure 'C' doesn't falsely match inside 'CSS' or 'React'
        text = "Expert in CSS and React with HTML."
        skills = extract_skills_from_text(text)
        self.assertNotIn("C", skills)
        self.assertNotIn("Go", skills)
        self.assertIn("CSS", skills)
        self.assertIn("React", skills)
        self.assertIn("HTML", skills)

    def test_skill_gap_formula_calculation(self):
        resume_skills = ["Python", "Django", "React", "PostgreSQL", "Git"]
        job_required = ["Python", "Django", "Docker", "AWS"]
        job_preferred = ["React", "Kubernetes"]

        result = analyze_skill_gap(
            resume_skills=resume_skills,
            job_required_skills=job_required,
            job_preferred_skills=job_preferred
        )

        # 2 out of 4 required matched -> 50.0%
        self.assertEqual(result['matched_required_count'], 2)
        self.assertEqual(result['total_required_count'], 4)
        self.assertEqual(result['match_score'], 50.0)
        self.assertEqual(result['matched_required_skills'], ["Django", "Python"])
        self.assertEqual(result['missing_required_skills'], ["AWS", "Docker"])
        self.assertEqual(result['matched_preferred_skills'], ["React"])
        self.assertEqual(result['missing_preferred_skills'], ["Kubernetes"])
        self.assertIn("Git", result['additional_skills'])
        self.assertTrue(len(result['recommendations']) >= 2)

    def test_empty_required_skills_handling(self):
        resume_skills = ["Python", "React"]
        job_required = []

        result = analyze_skill_gap(
            resume_skills=resume_skills,
            job_required_skills=job_required
        )
        self.assertIsNone(result['match_score'])
        self.assertIn("No specific required skills", result['score_explanation'])

    def test_learning_recommendation_contents(self):
        rec = get_learning_recommendation_for_skill("Docker")
        self.assertEqual(rec['skill'], "Docker")
        self.assertIn("https://docs.docker.com", rec['doc_url'])
        self.assertTrue(len(rec['roadmap']) > 0)
        self.assertTrue(len(rec['project_exercise']) > 0)

    def test_pdf_extraction_with_real_generated_pdf(self):
        # Create a small in-memory PDF using PyMuPDF
        doc = pymupdf.open()
        page = doc.new_page()
        page.insert_text((50, 72), "John Doe - Software Engineer\nSkills: Python, Django, PostgreSQL, Docker, Git")
        pdf_bytes = doc.tobytes()
        doc.close()

        pdf_stream = io.BytesIO(pdf_bytes)
        result = extract_text_from_pdf(pdf_stream)
        self.assertTrue(result['success'])
        self.assertEqual(result['status'], 'success')
        self.assertIn("Python", result['text'])
        self.assertIn("PostgreSQL", result['text'])


class ResumeAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='user1', email='u1@test.com', password='Password123!')
        self.user2 = User.objects.create_user(username='user2', email='u2@test.com', password='Password123!')

    def _generate_test_pdf_file(self, content="Jane Doe\nSkills: Python, React, TypeScript"):
        doc = pymupdf.open()
        page = doc.new_page()
        page.insert_text((50, 72), content)
        pdf_bytes = doc.tobytes()
        doc.close()
        return SimpleUploadedFile("resume.pdf", pdf_bytes, content_type="application/pdf")

    def test_resume_upload_and_skill_extraction(self):
        self.client.force_authenticate(user=self.user1)
        pdf_file = self._generate_test_pdf_file("Jane Doe Resume\nSkills: Python, React, TypeScript, SQL, Docker")
        
        response = self.client.post('/api/v1/resumes/', {'file': pdf_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'completed')
        self.assertIn('Python', response.data['extracted_skills'])
        self.assertIn('React', response.data['extracted_skills'])
        self.assertIn('Docker', response.data['extracted_skills'])

    def test_user_resume_isolation(self):
        # User 1 uploads resume
        self.client.force_authenticate(user=self.user1)
        pdf_file = self._generate_test_pdf_file()
        res = self.client.post('/api/v1/resumes/', {'file': pdf_file}, format='multipart')
        resume_id = res.data['id']

        # User 2 tries to access User 1's resume
        self.client.force_authenticate(user=self.user2)
        res_u2 = self.client.get(f'/api/v1/resumes/{resume_id}/')
        self.assertEqual(res_u2.status_code, status.HTTP_404_NOT_FOUND)

    def test_skill_analysis_api_flow(self):
        self.client.force_authenticate(user=self.user1)
        # 1. Upload resume
        pdf = self._generate_test_pdf_file("Skills: Python, Django, PostgreSQL, Git")
        res_upload = self.client.post('/api/v1/resumes/', {'file': pdf}, format='multipart')
        resume_id = res_upload.data['id']

        # 2. Create job description
        job = JobDescription.objects.create(
            owner=self.user1,
            title="Backend Engineer",
            company="Acme Corp",
            description="Looking for Backend Engineer with Python, Django, Docker, AWS.",
            required_skills=["Python", "Django", "Docker", "AWS"]
        )

        # 3. Create analysis
        analysis_res = self.client.post('/api/v1/analyses/', {
            'resume_id': resume_id,
            'job_id': job.id
        }, format='json')

        self.assertEqual(analysis_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(analysis_res.data['match_score'], 50.0) # 2/4
        self.assertIn("Python", analysis_res.data['matched_skills'])
        self.assertIn("Django", analysis_res.data['matched_skills'])
        self.assertIn("Docker", analysis_res.data['missing_skills'])
        self.assertIn("AWS", analysis_res.data['missing_skills'])
