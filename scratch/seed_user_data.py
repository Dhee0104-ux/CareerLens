import os
import sys
import django
from datetime import timedelta
import uuid

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from apps.resumes.models import Resume, SkillAnalysis
from apps.jobs.models import JobDescription
from apps.applications.models import JobApplication
from apps.resumes.services.skill_engine import analyze_skill_gap, extract_skills_from_text

def seed_data():
    # Find all users or the most recently active/created user
    users = User.objects.all().order_by('-date_joined')
    if not users.exists():
        print("No users found in database.")
        return

    for user in users:
        print(f"--> Seeding rich mock data for user: {user.username} ({user.email})...")

        # 1. Update Profile
        if hasattr(user, 'profile'):
            user.profile.headline = "Full Stack Software Engineer | Python, Django, React, Cloud"
            user.profile.target_role = "Senior Full Stack Engineer"
            user.profile.experience_level = "mid"
            user.profile.save()

        # 2. Add realistic Resumes
        resume_texts = [
            (
                "Alex_Johnson_FullStack_2026.pdf",
                """ALEX JOHNSON - Full Stack Software Engineer
Email: alex.johnson@example.com | San Francisco, CA | GitHub: github.com/alex-dev

SUMMARY:
Results-driven software engineer with 4+ years of experience building resilient microservices, high-throughput REST APIs, and responsive web applications. Expert in Python, Django, React, TypeScript, and PostgreSQL.

SKILLS:
Languages: Python, JavaScript, TypeScript, SQL, HTML, CSS, Shell
Backend: Django, Django REST Framework, Node.js, Express.js, REST APIs, GraphQL
Frontend: React, Redux, Tailwind CSS, Next.js
Databases: PostgreSQL, MySQL, Redis, SQLite
DevOps & Tools: Docker, Git, CI/CD, Linux, AWS, pytest, Agile

EXPERIENCE:
Software Engineer | NexaTech Systems (2023 - Present)
- Engineered scalable backend services using Django and PostgreSQL handling 5M+ daily requests.
- Built interactive frontend client features using React, TypeScript, and Tailwind CSS.
- Implemented automated CI/CD workflows and Dockerized development environments.

Associate Developer | CloudWave Labs (2021 - 2023)
- Developed RESTful API endpoints and integrated Redis caching layers for 40% latency reduction.
- Wrote comprehensive unit and integration tests with pytest and Jest.
"""
            ),
            (
                "Alex_Johnson_Backend_Focus.pdf",
                """ALEX JOHNSON - Backend Engineer
Email: alex.johnson@example.com

SKILLS:
Python, Django, FastAPI, Flask, PostgreSQL, Redis, Docker, Git, Linux, REST APIs, Microservices, SQL, Machine Learning, scikit-learn, Pandas, NumPy, Test-Driven Development (TDD).
"""
            )
        ]

        created_resumes = []
        for filename, text in resume_texts:
            skills = extract_skills_from_text(text)
            resume, _ = Resume.objects.get_or_create(
                owner=user,
                original_filename=filename,
                defaults={
                    'file_size': 142850,
                    'extracted_text': text,
                    'extracted_skills': skills,
                    'page_count': 1,
                    'status': 'completed',
                    'status_message': 'Successfully extracted text across 1 page(s).'
                }
            )
            created_resumes.append(resume)

        # 3. Add Job Descriptions
        job_data = [
            {
                'title': 'Senior Full Stack Engineer',
                'company': 'Stripe',
                'location': 'San Francisco, CA (Remote)',
                'employment_type': 'full_time',
                'salary_range': '$165,000 - $195,000',
                'description': 'Stripe is looking for a Senior Full Stack Engineer to build next-generation payment infrastructure and developer dashboards. Required: Python, Django, React, TypeScript, PostgreSQL, Docker, Kubernetes, AWS, CI/CD. Bonus: Redis, GraphQL.',
                'required_skills': ['Python', 'Django', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'CI/CD'],
                'preferred_skills': ['Redis', 'GraphQL', 'Microservices']
            },
            {
                'title': 'Backend Systems Engineer',
                'company': 'Datadog',
                'location': 'New York, NY (Hybrid)',
                'employment_type': 'full_time',
                'salary_range': '$170,000 - $200,000',
                'description': 'Datadog is searching for a Backend Engineer to scale telemetry data ingestion pipelines. Requirements: Python, PostgreSQL, Redis, Docker, Kubernetes, Linux, REST APIs, Microservices.',
                'required_skills': ['Python', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'Linux', 'REST APIs', 'Microservices'],
                'preferred_skills': ['Go', 'gRPC', 'Terraform']
            },
            {
                'title': 'Frontend / Product Engineer',
                'company': 'Figma',
                'location': 'San Francisco, CA (Remote)',
                'employment_type': 'full_time',
                'salary_range': '$160,000 - $185,000',
                'description': 'Join the Figma team to build delightful collaborative design interfaces. Required: React, TypeScript, JavaScript, CSS, HTML, Tailwind CSS, Redux, REST APIs.',
                'required_skills': ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Tailwind CSS', 'Redux', 'REST APIs'],
                'preferred_skills': ['Next.js', 'GraphQL']
            },
            {
                'title': 'Cloud Infrastructure & Platform Engineer',
                'company': 'Airbnb',
                'location': 'Seattle, WA (Remote)',
                'employment_type': 'full_time',
                'salary_range': '$175,000 - $210,000',
                'description': 'Airbnb seeks an Infrastructure Engineer to manage multi-region cloud clusters and automated deployment pipelines. Requirements: AWS, Docker, Kubernetes, Terraform, Linux, CI/CD, Python.',
                'required_skills': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'CI/CD', 'Python'],
                'preferred_skills': ['Shell', 'PostgreSQL']
            },
            {
                'title': 'AI & Backend Software Engineer',
                'company': 'Anthropic',
                'location': 'San Francisco, CA',
                'employment_type': 'full_time',
                'salary_range': '$180,000 - $220,000',
                'description': 'We are looking for engineers to design reliable API wrappers and inference pipelines. Requirements: Python, FastAPI, Django, PostgreSQL, Docker, Machine Learning, scikit-learn, NLP.',
                'required_skills': ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Docker', 'Machine Learning', 'scikit-learn', 'NLP'],
                'preferred_skills': ['PyTorch', 'Redis', 'AWS']
            }
        ]

        created_jobs = []
        for jd in job_data:
            job, _ = JobDescription.objects.get_or_create(
                owner=user,
                title=jd['title'],
                company=jd['company'],
                defaults={
                    'location': jd['location'],
                    'employment_type': jd['employment_type'],
                    'salary_range': jd['salary_range'],
                    'description': jd['description'],
                    'required_skills': jd['required_skills'],
                    'preferred_skills': jd['preferred_skills'],
                    'job_url': f"https://jobs.{jd['company'].lower()}.com/careers"
                }
            )
            created_jobs.append(job)

        # 4. Generate Skill Gap Analyses
        primary_resume = created_resumes[0]
        for job in created_jobs:
            if not SkillAnalysis.objects.filter(owner=user, job=job, resume=primary_resume).exists():
                gap = analyze_skill_gap(
                    resume_skills=primary_resume.extracted_skills,
                    job_required_skills=job.required_skills,
                    job_preferred_skills=job.preferred_skills,
                    resume_text=primary_resume.extracted_text,
                    job_text=job.description
                )
                SkillAnalysis.objects.create(
                    owner=user,
                    resume=primary_resume,
                    job=job,
                    resume_title=primary_resume.original_filename,
                    job_title=job.title,
                    company_name=job.company,
                    match_score=gap['match_score'],
                    preferred_match_score=gap['preferred_match_score'],
                    text_similarity_score=gap['text_similarity_score'],
                    score_explanation=gap['score_explanation'],
                    matched_skills=gap['matched_skills'],
                    missing_skills=gap['missing_required_skills'],
                    additional_skills=gap['additional_skills'],
                    recommendations=gap['recommendations']
                )

        # 5. Populate Job Applications across 4 months for rich timeline and Kanban
        now = timezone.now()
        apps_data = [
            {
                'job': created_jobs[0],
                'company': 'Stripe',
                'role_title': 'Senior Full Stack Engineer',
                'status': 'interview',
                'applied_date': (now - timedelta(days=20)).date(),
                'interview_date': now + timedelta(days=2, hours=4),
                'location': 'San Francisco, CA (Remote)',
                'salary_offered': '$175,000 / yr',
                'notes': 'Technical round scheduled with engineering manager and staff engineer. Prep: System design & React hooks.',
            },
            {
                'job': created_jobs[1],
                'company': 'Datadog',
                'role_title': 'Backend Systems Engineer',
                'status': 'offer',
                'applied_date': (now - timedelta(days=45)).date(),
                'interview_date': now - timedelta(days=5),
                'offer_deadline': (now + timedelta(days=7)).date(),
                'location': 'New York, NY (Hybrid)',
                'salary_offered': '$185,000 + equity',
                'notes': 'Received written offer! Reviewing compensation package and equity vesting schedule.',
            },
            {
                'job': created_jobs[2],
                'company': 'Figma',
                'role_title': 'Frontend / Product Engineer',
                'status': 'assessment',
                'applied_date': (now - timedelta(days=12)).date(),
                'interview_date': now + timedelta(days=4),
                'location': 'San Francisco, CA (Remote)',
                'salary_offered': '$165,000 / yr',
                'notes': 'Completed 90-minute frontend architecture coding challenge. Awaiting recruiter debrief.',
            },
            {
                'job': created_jobs[3],
                'company': 'Airbnb',
                'role_title': 'Cloud Infrastructure Engineer',
                'status': 'applied',
                'applied_date': (now - timedelta(days=5)).date(),
                'location': 'Seattle, WA (Remote)',
                'salary_offered': '$180,000 / yr',
                'notes': 'Applied via referral from former colleague. Resume tailored for AWS and Terraform platform skills.',
            },
            {
                'job': created_jobs[4],
                'company': 'Anthropic',
                'role_title': 'AI & Backend Software Engineer',
                'status': 'wishlist',
                'applied_date': now.date(),
                'location': 'San Francisco, CA',
                'salary_offered': '$190,000 / yr',
                'notes': 'Preparing specialized portfolio project on LLM response streaming and vector similarity before applying.',
            },
            {
                'job': None,
                'company': 'GitHub',
                'role_title': 'Platform Tools Engineer',
                'status': 'rejected',
                'applied_date': (now - timedelta(days=60)).date(),
                'location': 'Remote',
                'notes': 'Role was filled internally. Encouraged to reapply for upcoming Q4 openings.',
            },
            {
                'job': None,
                'company': 'Vercel',
                'role_title': 'Software Engineer - Ecosystem',
                'status': 'applied',
                'applied_date': (now - timedelta(days=75)).date(),
                'location': 'Remote',
                'notes': 'Submitted application with live portfolio demo.',
            },
            {
                'job': None,
                'company': 'Uber',
                'role_title': 'Backend Engineer - Logistics',
                'status': 'interview',
                'applied_date': (now - timedelta(days=90)).date(),
                'location': 'Sunnyvale, CA',
                'notes': 'Completed initial technical phone screen on concurrency and SQL query tuning.',
            }
        ]

        for item in apps_data:
            JobApplication.objects.get_or_create(
                owner=user,
                company=item['company'],
                role_title=item['role_title'],
                defaults={
                    'job': item['job'],
                    'status': item['status'],
                    'applied_date': item['applied_date'],
                    'interview_date': item.get('interview_date'),
                    'offer_deadline': item.get('offer_deadline'),
                    'location': item.get('location', ''),
                    'salary_offered': item.get('salary_offered', ''),
                    'notes': item.get('notes', ''),
                    'job_url': f"https://jobs.{item['company'].lower()}.com"
                }
            )

        print(f"✓ Successfully seeded {len(created_resumes)} resumes, {len(created_jobs)} jobs, {len(created_jobs)} skill analyses, and {len(apps_data)} applications for {user.username}!")

if __name__ == '__main__':
    seed_data()
