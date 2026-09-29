import os
import uuid
from datetime import timedelta
from django.utils import timezone
from django.core.files.base import ContentFile
from django.contrib.auth.models import User

from apps.resumes.models import Resume, SkillAnalysis
from apps.jobs.models import JobDescription
from apps.applications.models import JobApplication
from apps.resumes.services.skill_engine import analyze_skill_gap


def seed_user_demo_data(user: User, clear_existing: bool = True):
    """
    Seeds comprehensive mock data for a given user for realistic testing.
    Includes Resumes, Job Descriptions, Skill Gap Analyses, and Job Applications
    spanning multiple statuses and dates.
    """
    if clear_existing:
        SkillAnalysis.objects.filter(owner=user).delete()
        JobApplication.objects.filter(owner=user).delete()
        JobDescription.objects.filter(owner=user).delete()
        Resume.objects.filter(owner=user).delete()

    now = timezone.now()
    today = timezone.localdate()

    # -------------------------------------------------------------
    # 1. Resumes
    # -------------------------------------------------------------
    resume_1_text = """
    Alex Rivera - Senior Full Stack Engineer
    San Francisco, CA | alex.rivera@example.com | github.com/alexrivera | linkedin.com/in/alexrivera

    SUMMARY
    Passionate Full Stack Engineer with 4+ years of experience designing scalable web applications, 
    RESTful microservices, and reactive user interfaces using TypeScript, React, Node.js, Python, and PostgreSQL.

    TECHNICAL SKILLS
    Languages & Frameworks: JavaScript, TypeScript, React, Next.js, Node.js, Express, Python, Django, HTML5, CSS3, Tailwind CSS, Redux
    Databases & Tools: PostgreSQL, MongoDB, Redis, Git, Docker, GitHub Actions, AWS, REST API, GraphQL, WebSockets, Linux, Jest, Vite
    Methodologies: Agile, CI/CD, Unit Testing, System Design, Microservices

    EXPERIENCE
    Senior Software Engineer | CloudScale Tech (2022 - Present)
    - Architected and built multi-tenant SaaS dashboard using React, TypeScript, and Tailwind CSS serving 80k+ MAU.
    - Designed and implemented high-throughput RESTful APIs with Python, Django REST Framework, and PostgreSQL.
    - Reduced API response latency by 38% via Redis caching layers and query indexing.
    - Integrated automated CI/CD deployment pipelines using Docker and GitHub Actions to AWS ECS.

    Software Engineer | Nexus Digital (2020 - 2022)
    - Developed frontend features using React, Redux, and Node.js backend services.
    - Built comprehensive unit and integration test suites using Jest and Pytest achieving 88% test coverage.
    """

    resume_1 = Resume(
        owner=user,
        original_filename="Alex_Rivera_FullStack_Resume.pdf",
        file_size=142850,
        page_count=2,
        extracted_text=resume_1_text,
        extracted_skills=[
            "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "Python", 
            "Django", "PostgreSQL", "MongoDB", "Redis", "Git", "Docker", "AWS", "REST API", 
            "GraphQL", "WebSockets", "HTML5", "CSS3", "Tailwind CSS", "Redux", "Jest", "CI/CD", "Linux"
        ],
        status="completed",
        status_message="Extracted 24 skills successfully."
    )
    # Save with a dummy in-memory PDF placeholder
    resume_1.file.save("Alex_Rivera_FullStack_Resume.pdf", ContentFile(b"%PDF-1.4 demo resume placeholder"), save=False)
    resume_1.save()

    resume_2_text = """
    Alex Rivera - Cloud & DevOps Specialist Resume
    Specializing in AWS, Kubernetes, Terraform, Docker, Python scripting, PostgreSQL, CI/CD, and monitoring with Prometheus & Grafana.
    """
    resume_2 = Resume(
        owner=user,
        original_filename="Alex_Rivera_DevOps_Cloud.pdf",
        file_size=118400,
        page_count=1,
        extracted_text=resume_2_text,
        extracted_skills=["Python", "AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "PostgreSQL", "Linux", "Git"],
        status="completed",
        status_message="Extracted 9 skills successfully."
    )
    resume_2.file.save("Alex_Rivera_DevOps_Cloud.pdf", ContentFile(b"%PDF-1.4 demo devops resume"), save=False)
    resume_2.save()

    # -------------------------------------------------------------
    # 2. Job Descriptions
    # -------------------------------------------------------------
    job_stripe = JobDescription.objects.create(
        owner=user,
        title="Senior Full Stack Engineer",
        company="Stripe",
        location="San Francisco, CA (Hybrid)",
        employment_type="full_time",
        salary_range="$175,000 - $215,000",
        job_url="https://stripe.com/jobs/full-stack-sr",
        description="""Stripe is looking for a Senior Full Stack Engineer to build next-generation payment infrastructure and merchant dashboards.
        You will work across the stack with TypeScript, React, Node.js, Python, PostgreSQL, Redis, and AWS.
        Requirements:
        - Strong proficiency in React, TypeScript, Node.js, Python, and PostgreSQL.
        - Experience with Docker, CI/CD, and AWS infrastructure.
        - Familiarity with Kubernetes, GraphQL, and microservices architecture.
        - Nice to have: Kafka, Golang, and payment gateway compliance experience.""",
        required_skills=["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker", "AWS", "CI/CD", "REST API"],
        preferred_skills=["Kubernetes", "GraphQL", "Redis", "Kafka", "Golang"]
    )

    job_google = JobDescription.objects.create(
        owner=user,
        title="Staff Frontend Engineer - Web Ecosystem",
        company="Google",
        location="Mountain View, CA / Remote",
        employment_type="full_time",
        salary_range="$190,000 - $240,000",
        job_url="https://careers.google.com/jobs/staff-frontend",
        description="""Google is seeking a Staff Frontend Engineer to lead architecture for scalable web clients.
        Requirements:
        - Deep mastery of TypeScript, JavaScript, React, WebSockets, HTML5, CSS3, Tailwind CSS, and Web Performance Optimization.
        - Solid experience with Next.js, Redux, Jest, CI/CD, and WebAssembly.
        - Passion for modern UX, accessibility, and high frame-rate web applications.""",
        required_skills=["TypeScript", "JavaScript", "React", "Next.js", "WebSockets", "HTML5", "CSS3", "Tailwind CSS", "Redux", "Jest", "CI/CD"],
        preferred_skills=["WebAssembly", "GraphQL", "Docker", "PWA"]
    )

    job_netflix = JobDescription.objects.create(
        owner=user,
        title="Senior Distributed Systems & Backend Engineer",
        company="Netflix",
        location="Los Gatos, CA (Remote Friendly)",
        employment_type="full_time",
        salary_range="$210,000 - $275,000",
        job_url="https://jobs.netflix.com/backend-sr",
        description="""Netflix is looking for a Senior Backend Engineer to build resilient distributed streaming microservices.
        Required: Python, Django, PostgreSQL, Redis, Docker, Kubernetes, AWS, Kafka, Microservices.
        Preferred: Golang, Terraform, Prometheus, Elasticsearch, gRPC.""",
        required_skills=["Python", "Django", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "Kafka", "REST API"],
        preferred_skills=["Golang", "Terraform", "Prometheus", "Elasticsearch", "gRPC"]
    )

    job_spotify = JobDescription.objects.create(
        owner=user,
        title="Full Stack Engineer - Creator Tools",
        company="Spotify",
        location="New York, NY (Hybrid)",
        employment_type="full_time",
        salary_range="$165,000 - $195,000",
        job_url="https://lifeatspotify.com/jobs/full-stack-creator",
        description="""Join Spotify's Creator Tools team building rich audio streaming apps.
        Required: React, TypeScript, Node.js, Python, PostgreSQL, GraphQL, Docker, Git.
        Preferred: WebSockets, Next.js, AWS, Kubernetes.""",
        required_skills=["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "GraphQL", "Docker", "Git"],
        preferred_skills=["WebSockets", "Next.js", "AWS", "Kubernetes"]
    )

    # -------------------------------------------------------------
    # 3. Skill Gap Analyses
    # -------------------------------------------------------------
    res1_skills = resume_1.extracted_skills

    # Analysis 1: Alex Rivera vs Stripe (High match: 100% required, some missing preferred)
    analysis_stripe = analyze_skill_gap(
        resume_skills=res1_skills,
        job_required_skills=job_stripe.required_skills,
        job_preferred_skills=job_stripe.preferred_skills,
        resume_text=resume_1.extracted_text,
        job_text=job_stripe.description
    )
    SkillAnalysis.objects.create(
        owner=user,
        resume=resume_1,
        job=job_stripe,
        resume_title=resume_1.original_filename,
        job_title=job_stripe.title,
        company_name=job_stripe.company,
        match_score=analysis_stripe["match_score"],
        preferred_match_score=analysis_stripe["preferred_match_score"],
        text_similarity_score=analysis_stripe["text_similarity_score"],
        score_explanation=analysis_stripe["score_explanation"],
        matched_skills=analysis_stripe["matched_skills"],
        missing_skills=analysis_stripe["missing_required_skills"] + analysis_stripe["missing_preferred_skills"],
        additional_skills=analysis_stripe["additional_skills"],
        recommendations=analysis_stripe["recommendations"]
    )

    # Analysis 2: Alex Rivera vs Netflix (Missing Kubernetes, Kafka)
    analysis_netflix = analyze_skill_gap(
        resume_skills=res1_skills,
        job_required_skills=job_netflix.required_skills,
        job_preferred_skills=job_netflix.preferred_skills,
        resume_text=resume_1.extracted_text,
        job_text=job_netflix.description
    )
    SkillAnalysis.objects.create(
        owner=user,
        resume=resume_1,
        job=job_netflix,
        resume_title=resume_1.original_filename,
        job_title=job_netflix.title,
        company_name=job_netflix.company,
        match_score=analysis_netflix["match_score"],
        preferred_match_score=analysis_netflix["preferred_match_score"],
        text_similarity_score=analysis_netflix["text_similarity_score"],
        score_explanation=analysis_netflix["score_explanation"],
        matched_skills=analysis_netflix["matched_skills"],
        missing_skills=analysis_netflix["missing_required_skills"] + analysis_netflix["missing_preferred_skills"],
        additional_skills=analysis_netflix["additional_skills"],
        recommendations=analysis_netflix["recommendations"]
    )

    # Analysis 3: Alex Rivera vs Spotify
    analysis_spotify = analyze_skill_gap(
        resume_skills=res1_skills,
        job_required_skills=job_spotify.required_skills,
        job_preferred_skills=job_spotify.preferred_skills,
        resume_text=resume_1.extracted_text,
        job_text=job_spotify.description
    )
    SkillAnalysis.objects.create(
        owner=user,
        resume=resume_1,
        job=job_spotify,
        resume_title=resume_1.original_filename,
        job_title=job_spotify.title,
        company_name=job_spotify.company,
        match_score=analysis_spotify["match_score"],
        preferred_match_score=analysis_spotify["preferred_match_score"],
        text_similarity_score=analysis_spotify["text_similarity_score"],
        score_explanation=analysis_spotify["score_explanation"],
        matched_skills=analysis_spotify["matched_skills"],
        missing_skills=analysis_spotify["missing_required_skills"] + analysis_spotify["missing_preferred_skills"],
        additional_skills=analysis_spotify["additional_skills"],
        recommendations=analysis_spotify["recommendations"]
    )

    # -------------------------------------------------------------
    # 4. Job Applications (Spanning timeline & statuses for rich analytics)
    # -------------------------------------------------------------
    applications_data = [
        {
            "company": "Stripe",
            "role_title": "Senior Full Stack Engineer",
            "job": job_stripe,
            "status": "interview",
            "applied_date": today - timedelta(days=12),
            "interview_date": now + timedelta(days=3, hours=4),
            "salary_offered": "$195,000 + Equity",
            "location": "San Francisco, CA (Hybrid)",
            "job_url": "https://stripe.com/jobs/full-stack-sr",
            "notes": "Passed Round 1 Recruiter & Technical screening. Final system design loop scheduled for Thursday!"
        },
        {
            "company": "Google",
            "role_title": "Staff Frontend Engineer",
            "job": job_google,
            "status": "assessment",
            "applied_date": today - timedelta(days=8),
            "interview_date": None,
            "salary_offered": "",
            "location": "Mountain View, CA / Remote",
            "job_url": "https://careers.google.com/jobs/staff-frontend",
            "notes": "Completed 90-minute online coding test on web performance & algorithms."
        },
        {
            "company": "Spotify",
            "role_title": "Full Stack Engineer - Creator Tools",
            "job": job_spotify,
            "status": "offer",
            "applied_date": today - timedelta(days=35),
            "interview_date": now - timedelta(days=4),
            "offer_deadline": today + timedelta(days=10),
            "salary_offered": "$185,000 base + 40k RSU + 15k sign-on",
            "location": "New York, NY (Hybrid)",
            "job_url": "https://lifeatspotify.com/jobs/full-stack-creator",
            "notes": "Official offer letter received! Negotiating stock grant and start date."
        },
        {
            "company": "Netflix",
            "role_title": "Senior Distributed Systems Engineer",
            "job": job_netflix,
            "status": "applied",
            "applied_date": today - timedelta(days=4),
            "interview_date": None,
            "salary_offered": "",
            "location": "Los Gatos, CA (Remote)",
            "job_url": "https://jobs.netflix.com/backend-sr",
            "notes": "Submitted with tailored resume highlighting Python & high concurrency experience."
        },
        {
            "company": "Airbnb",
            "role_title": "Senior Frontend Developer",
            "job": None,
            "status": "interview",
            "applied_date": today - timedelta(days=22),
            "interview_date": now + timedelta(days=6, hours=2),
            "salary_offered": "$180,000",
            "location": "San Francisco, CA",
            "job_url": "https://careers.airbnb.com",
            "notes": "Team matching conversation with Guest Experience UI lead."
        },
        {
            "company": "Figma",
            "role_title": "Frontend Systems Architect",
            "job": None,
            "status": "wishlist",
            "applied_date": today - timedelta(days=2),
            "interview_date": None,
            "salary_offered": "",
            "location": "San Francisco, CA / Remote",
            "job_url": "https://figma.com/careers",
            "notes": "Drafting portfolio presentation on Canvas rendering performance before applying."
        },
        {
            "company": "Vercel",
            "role_title": "Next.js Framework Engineer",
            "job": None,
            "status": "applied",
            "applied_date": today - timedelta(days=60),
            "interview_date": None,
            "salary_offered": "",
            "location": "Remote (Global)",
            "job_url": "https://vercel.com/careers",
            "notes": "Application under review by Developer Experience hiring committee."
        },
        {
            "company": "Datadog",
            "role_title": "Full Stack Platform Engineer",
            "job": None,
            "status": "rejected",
            "applied_date": today - timedelta(days=85),
            "interview_date": None,
            "salary_offered": "",
            "location": "Boston, MA / Remote",
            "job_url": "https://datadoghq.com/careers",
            "notes": "Position filled internally. Encouraged to reapply for Q4 openings."
        },
        {
            "company": "OpenAI",
            "role_title": "Full Stack Web Engineer - ChatGPT UI",
            "job": None,
            "status": "applied",
            "applied_date": today - timedelta(days=1),
            "interview_date": None,
            "salary_offered": "",
            "location": "San Francisco, CA",
            "job_url": "https://openai.com/careers",
            "notes": "Submitted with referral from open-source contributor network."
        },
        {
            "company": "Linear",
            "role_title": "Product Engineer (TypeScript & React)",
            "job": None,
            "status": "withdrawn",
            "applied_date": today - timedelta(days=110),
            "interview_date": None,
            "salary_offered": "",
            "location": "Remote",
            "job_url": "https://linear.app/careers",
            "notes": "Withdrew to focus on Stripe and Spotify late-stage interview loops."
        }
    ]

    for item in applications_data:
        JobApplication.objects.create(
            owner=user,
            job=item["job"],
            company=item["company"],
            role_title=item["role_title"],
            status=item["status"],
            applied_date=item["applied_date"],
            interview_date=item["interview_date"],
            offer_deadline=item.get("offer_deadline"),
            salary_offered=item["salary_offered"],
            location=item["location"],
            job_url=item["job_url"],
            notes=item["notes"]
        )

    return {
        "resumes_count": Resume.objects.filter(owner=user).count(),
        "jobs_count": JobDescription.objects.filter(owner=user).count(),
        "analyses_count": SkillAnalysis.objects.filter(owner=user).count(),
        "applications_count": JobApplication.objects.filter(owner=user).count(),
    }
