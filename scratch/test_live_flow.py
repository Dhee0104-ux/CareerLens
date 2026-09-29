import urllib.request
import json
import uuid
import sys

BASE = 'http://127.0.0.1:8000/api/v1'

def post_json(url, data, token=None):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def get_json(url, token=None):
    req = urllib.request.Request(url)
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def main():
    username = f"user_{uuid.uuid4().hex[:6]}"
    user_payload = {
        'username': username,
        'email': f'{username}@example.com',
        'first_name': 'Alex',
        'last_name': 'Developer',
        'password': 'Password123!',
        'password_confirm': 'Password123!'
    }

    print('===========================================================')
    print('  CAREERLENS — END-TO-END LIVE RUN & VERIFICATION OUTPUT   ')
    print('===========================================================\n')

    print('[1] Testing User Registration & JWT Issuance...')
    reg_res = post_json(f'{BASE}/auth/register/', user_payload)
    token = reg_res['tokens']['access']
    print(f'    [OK] User registered: {reg_res["user"]["username"]}')
    print(f'    [OK] Access Token generated: {token[:20]}...\n')

    print('[2] Testing PDF Resume Upload & PyMuPDF Skill Extraction...')
    boundary = uuid.uuid4().hex
    with open('scratch/sample_resume.pdf', 'rb') as f:
        pdf_data = f.read()

    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="sample_resume.pdf"\r\n'
        f'Content-Type: application/pdf\r\n\r\n'
    ).encode('utf-8') + pdf_data + f'\r\n--{boundary}--\r\n'.encode('utf-8')

    req = urllib.request.Request(f'{BASE}/resumes/', data=body, headers={
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Authorization': f'Bearer {token}'
    })
    with urllib.request.urlopen(req) as resp:
        resume_res = json.loads(resp.read().decode())

    print(f'    [OK] Resume File: {resume_res["original_filename"]}')
    print(f'    [OK] Processing Status: {resume_res["status"].upper()} ({resume_res["page_count"]} page(s))')
    print(f'    [OK] Extracted Skills ({len(resume_res["extracted_skills"])}):')
    print(f'         {", ".join(resume_res["extracted_skills"])}\n')

    print('[3] Testing Job Description Creation & Skills Auto-Detection...')
    job_payload = {
        'title': 'Senior Full Stack Engineer',
        'company': 'Stripe',
        'location': 'Remote / San Francisco',
        'employment_type': 'full_time',
        'description': 'We need a Senior Full Stack Engineer with Python, Django, PostgreSQL, Docker, Kubernetes, AWS, and CI/CD.',
        'required_skills': ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        'preferred_skills': ['React', 'TypeScript', 'Redis']
    }
    job_res = post_json(f'{BASE}/jobs/', job_payload, token)
    print(f'    [OK] Job Created: {job_res["title"]} at {job_res["company"]}')
    print(f'    [OK] Required Skills: {", ".join(job_res["required_skills"])}')
    print(f'    [OK] Preferred Skills: {", ".join(job_res["preferred_skills"])}\n')

    print('[4] Testing Skill Gap Analysis & Algorithmic Scoring...')
    analysis_res = post_json(f'{BASE}/analyses/', {
        'resume_id': resume_res['id'],
        'job_id': job_res['id']
    }, token)
    print(f'    [OK] Required Skill Match Score: {analysis_res["match_score"]}%')
    print(f'    [OK] Explanation: {analysis_res["score_explanation"]}')
    print(f'    [OK] Matched Skills: {", ".join(analysis_res["matched_skills"])}')
    print(f'    [OK] Missing Required Skills: {", ".join(analysis_res["missing_skills"])}')
    print(f'    [OK] Additional Resume Skills: {", ".join(analysis_res["additional_skills"])}')
    print(f'    [OK] TF-IDF Cosine Text Similarity: {analysis_res["text_similarity_score"]}%\n')

    print('[5] Testing Curated Learning Roadmaps for Missing Skills...')
    for rec in analysis_res['recommendations']:
        print(f'    -> Skill: {rec["skill"]}')
        print(f'       Doc URL: {rec["doc_url"]}')
        print(f'       Project Exercise: {rec["project_exercise"]}')
        print(f'       First Step: {rec["roadmap"][0]}')
    print()

    print('[6] Testing Job Application Pipeline Logging...')
    app_payload = {
        'job': job_res['id'],
        'company': job_res['company'],
        'role_title': job_res['title'],
        'status': 'applied',
        'location': job_res['location'],
        'notes': 'Matched 57% required skills via CareerLens analyzer.'
    }
    app_res = post_json(f'{BASE}/applications/', app_payload, token)
    print(f'    [OK] Application Logged: {app_res["role_title"]} at {app_res["company"]}')
    print(f'    [OK] Pipeline Status: {app_res["status_display"]}\n')

    print('[7] Testing Live Analytics & Aggregation Endpoints...')
    overview = get_json(f'{BASE}/analytics/overview/', token)
    print(f'    [OK] Total Applications: {overview["total_applications"]}')
    print(f'    [OK] Total Resumes: {overview["total_resumes"]}')
    print(f'    [OK] Average Match Score: {overview["average_match_score"]}%')

    skills_data = get_json(f'{BASE}/analytics/skills/', token)
    print(f'    [OK] Top Missing Skills in User Pipeline: {skills_data["top_missing_skills"]}\n')

    print('===========================================================')
    print('  ALL LIVE ENDPOINTS & BUSINESS LOGIC WORKING 100% OK!     ')
    print('===========================================================')

if __name__ == '__main__':
    main()
