"""
CareerLens Skill Matching & Recommendation Engine

Provides:
- Token-aware skill extraction with comprehensive alias normalization.
- PyMuPDF-based safe PDF text extraction with status codes.
- Transparent skill matching formula: (Matched Required / Total Required) * 100.
- Scikit-learn TF-IDF & Cosine textual similarity metric.
- Curated local learning recommendation database with verified official docs.
"""

import re
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Comprehensive Skill Catalog: Standard Name -> List of aliases / keywords
SKILL_CATALOG = {
    # Languages
    "Python": ["python", "python3", "py", "cpython"],
    "JavaScript": ["javascript", "js", "ecmascript", "es6", "es2015", "es2020"],
    "TypeScript": ["typescript", "ts"],
    "Java": ["java", "jvm", "core java", "j2ee"],
    "C++": ["c++", "cpp"],
    "C#": ["c#", "csharp", "c sharp"],
    "C": ["c language", "ansi c", r"\bc\b"],
    "Go": ["golang", "go language", r"\bgo\b"],
    "Rust": ["rust", "rustlang"],
    "PHP": ["php", "php7", "php8"],
    "Ruby": ["ruby", "ruby on rails", "ror"],
    "Swift": ["swift", "swiftui"],
    "Kotlin": ["kotlin", "android kotlin"],
    "HTML": ["html", "html5"],
    "CSS": ["css", "css3", "sass", "scss", "less"],
    "SQL": ["sql", "transact-sql", "t-sql", "pl/sql", "plsql"],
    "Shell": ["bash", "shell script", "shell scripting", "zsh", "powershell"],

    # Frameworks & Libraries
    "Django": ["django", "django rest framework", "drf"],
    "FastAPI": ["fastapi", "fast-api"],
    "Flask": ["flask"],
    "React": ["react", "react.js", "reactjs", "react native"],
    "Next.js": ["next.js", "nextjs", "next"],
    "Vue.js": ["vue", "vue.js", "vuejs", "vue3"],
    "Angular": ["angular", "angularjs", "angular 2+"],
    "Node.js": ["node.js", "nodejs", "node"],
    "Express.js": ["express", "express.js", "expressjs"],
    "Spring Boot": ["spring boot", "springboot", "spring framework", "spring"],
    "ASP.NET": ["asp.net", ".net", ".net core", "dotnet", "dotnet core"],
    "Tailwind CSS": ["tailwind", "tailwindcss", "tailwind css"],
    "Bootstrap": ["bootstrap", "bootstrap 5"],
    "Redux": ["redux", "redux toolkit", "rtk"],
    "GraphQL": ["graphql", "apollo graphql"],
    "REST APIs": ["rest", "restful", "rest api", "rest apis", "restful apis", "web apis"],
    "gRPC": ["grpc", "protocol buffers", "protobuf"],

    # Databases & Storage
    "PostgreSQL": ["postgresql", "postgres", "psql"],
    "MySQL": ["mysql"],
    "SQLite": ["sqlite", "sqlite3"],
    "MongoDB": ["mongodb", "mongo"],
    "Redis": ["redis"],
    "Elasticsearch": ["elasticsearch", "elastic search", "opensearch"],
    "Firebase": ["firebase", "firestore", "firebase auth"],
    "DynamoDB": ["dynamodb", "aws dynamodb"],
    "Cassandra": ["cassandra", "apache cassandra"],
    "Oracle Database": ["oracle db", "oracle database"],

    # Cloud & DevOps
    "Docker": ["docker", "dockerfile", "docker compose", "containerization", "containers"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services", "ec2", "s3", "lambda", "rds", "cloudformation"],
    "Google Cloud (GCP)": ["gcp", "google cloud", "google cloud platform", "bigquery"],
    "Microsoft Azure": ["azure", "microsoft azure", "azure devops"],
    "CI/CD": ["ci/cd", "continuous integration", "continuous deployment", "github actions", "gitlab ci", "jenkins"],
    "Terraform": ["terraform", "iac", "infrastructure as code"],
    "Linux": ["linux", "ubuntu", "debian", "centos", "redhat", "unix"],
    "Nginx": ["nginx"],
    "Git": ["git", "github", "gitlab", "bitbucket", "version control"],

    # Data Science, AI & ML
    "Machine Learning": ["machine learning", "ml", "statistical learning"],
    "Deep Learning": ["deep learning", "neural networks", "dl"],
    "NLP": ["nlp", "natural language processing", "text processing", "llm", "large language models"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "TensorFlow": ["tensorflow", "tf"],
    "PyTorch": ["pytorch", "torch"],
    "Pandas": ["pandas"],
    "NumPy": ["numpy"],
    "Data Analysis": ["data analysis", "data analytics", "eda", "exploratory data analysis"],
    "Computer Vision": ["computer vision", "opencv", "cv", "image processing"],
    "Tableau": ["tableau", "data visualization"],
    "Power BI": ["power bi", "powerbi"],

    # Engineering Practices & Methodologies
    "Agile": ["agile", "scrum", "kanban", "sprints"],
    "Test-Driven Development (TDD)": ["tdd", "test driven development", "unit testing", "pytest", "jest", "unittest"],
    "Microservices": ["microservices", "microservice architecture", "distributed systems"],
    "System Design": ["system design", "software architecture", "scalability", "high availability"],
    "Cybersecurity": ["cybersecurity", "security", "owasp", "oauth", "jwt", "authentication"],
}

# Curated Learning Roadmap and Official Documentation
LEARNING_RECOMMENDATIONS = {
    "Python": {
        "explanation": "Python is a high-level, versatile programming language renowned for clean readability, rapid development, and broad usage in backend web development, scripting, data engineering, and machine learning.",
        "roadmap": [
            "1. Master core syntax, data structures (lists, dicts, sets, tuples), and list comprehensions.",
            "2. Understand Object-Oriented Programming (Classes, Inheritance, Dunder methods) and generators/decorators.",
            "3. Practice writing modular code, virtual environments (venv), and unit testing with pytest."
        ],
        "project_exercise": "Build a modular CLI task manager or a multi-threaded web scraper that persists structured data to a SQLite database.",
        "doc_url": "https://docs.python.org/3/"
    },
    "JavaScript": {
        "explanation": "JavaScript is the foundational programming language of the web, powering dynamic frontend client applications and scalable backend systems via Node.js.",
        "roadmap": [
            "1. Master modern ES6+ syntax: let/const, arrow functions, destructuring, modules.",
            "2. Understand Asynchronous JS: Event Loop, Callbacks, Promises, and async/await.",
            "3. Learn DOM manipulation, browser APIs, and event delegation."
        ],
        "project_exercise": "Create an interactive interactive dashboard with real-time API polling, search filtering, and client-side caching.",
        "doc_url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript"
    },
    "TypeScript": {
        "explanation": "TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript, providing compile-time type safety, intelligent autocompletion, and robust maintainability in large codebases.",
        "roadmap": [
            "1. Learn primitive types, interfaces, type aliases, and union/intersection types.",
            "2. Master Generics, utility types (Partial, Pick, Omit), and narrowing.",
            "3. Configure tsconfig.json and migrate a vanilla JS project to TypeScript."
        ],
        "project_exercise": "Refactor a full-stack CRUD application to utilize shared TypeScript types and interfaces between frontend and backend.",
        "doc_url": "https://www.typescriptlang.org/docs/"
    },
    "Django": {
        "explanation": "Django is a high-level, batteries-included Python web framework that encourages rapid development, clean MVC/MVT architecture, and secure-by-default web applications.",
        "roadmap": [
            "1. Master Django ORM: Models, Migrations, QuerySets, Relationships (ForeignKey, ManyToMany).",
            "2. Understand Request-Response flow, Class-Based Views (CBVs), and Django REST Framework (DRF).",
            "3. Implement JWT/Session authentication, permissions, pagination, and file uploads."
        ],
        "project_exercise": "Build a RESTful API backend for a multi-tenant application with token authentication, model relationships, and automated unit tests.",
        "doc_url": "https://docs.djangoproject.com/en/stable/"
    },
    "React": {
        "explanation": "React is a popular component-based JavaScript library for building responsive, performant, and dynamic single-page web user interfaces.",
        "roadmap": [
            "1. Master JSX, Component composition, and Props vs. State.",
            "2. Master essential React Hooks: useState, useEffect, useContext, useMemo, and custom hooks.",
            "3. Implement Client-side routing with React Router and centralized API data fetching."
        ],
        "project_exercise": "Develop an interactive Kanban board with drag-and-drop task status updates, modals, and local state persistence.",
        "doc_url": "https://react.dev/learn"
    },
    "Docker": {
        "explanation": "Docker is an industry-standard containerization platform that packages applications and all their dependencies into lightweight, isolated containers for seamless local development and production deployment.",
        "roadmap": [
            "1. Learn Docker core concepts: Images, Containers, Dockerfiles, and layers.",
            "2. Master multi-stage builds and Docker Compose for orchestrating multi-service stacks (Web + DB + Cache).",
            "3. Understand volume mounting for local dev persistence and environment variable management."
        ],
        "project_exercise": "Containerize a full-stack Django + React + PostgreSQL application using Docker Compose with persistent volumes and healthchecks.",
        "doc_url": "https://docs.docker.com/get-started/"
    },
    "PostgreSQL": {
        "explanation": "PostgreSQL is a powerful, open-source object-relational database system known for reliability, robust SQL compliance, ACID guarantees, and JSONB indexing capabilities.",
        "roadmap": [
            "1. Learn relational schema design, primary/foreign keys, and normalization (3NF).",
            "2. Practice writing complex queries: JOINs, Subqueries, Aggregations, GROUP BY, and Indexes.",
            "3. Understand transaction isolation levels, constraints, and query execution plans (EXPLAIN ANALYZE)."
        ],
        "project_exercise": "Design an e-commerce database schema with order histories, user roles, and indexed full-text product search.",
        "doc_url": "https://www.postgresql.org/docs/"
    },
    "Git": {
        "explanation": "Git is the standard distributed version control system for tracking source code changes and collaborating in software teams.",
        "roadmap": [
            "1. Master branching, committing, merging, and rebasing workflows.",
            "2. Understand GitHub Pull Request lifecycle, merge conflicts resolution, and git stash/cherry-pick.",
            "3. Learn semantic commit messages and Git tags for release versioning."
        ],
        "project_exercise": "Simulate a collaborative team workflow: create feature branches, make pull requests, resolve merge conflicts, and tag release versions.",
        "doc_url": "https://git-scm.com/doc"
    },
    "REST APIs": {
        "explanation": "Representational State Transfer (REST) is the architectural standard for networked hypermedia applications and stateless HTTP client-server communications.",
        "roadmap": [
            "1. Learn HTTP methods (GET, POST, PUT, PATCH, DELETE) and appropriate status codes.",
            "2. Master standard URI design patterns, request validation, error responses, and pagination.",
            "3. Implement authentication headers (Bearer JWT) and API versioning."
        ],
        "project_exercise": "Design and document a complete versioned REST API with OpenAPI/Swagger specifications and comprehensive integration tests.",
        "doc_url": "https://restfulapi.net/"
    },
    "SQL": {
        "explanation": "Structured Query Language (SQL) is the universal domain-specific language used for managing, querying, and manipulating data held in relational database systems.",
        "roadmap": [
            "1. Master DDL (CREATE, ALTER) and DML (SELECT, INSERT, UPDATE, DELETE).",
            "2. Practice complex multi-table JOINs, CASE statements, and aggregate functions.",
            "3. Learn window functions (RANK, ROW_NUMBER, OVER) and database indexing strategies."
        ],
        "project_exercise": "Write analytical SQL scripts to calculate monthly revenue cohorts, customer retention rates, and top-selling product metrics.",
        "doc_url": "https://www.w3schools.com/sql/"
    },
    "scikit-learn": {
        "explanation": "scikit-learn is the premier Python machine learning library featuring efficient tools for predictive data analysis, classification, regression, clustering, and text feature extraction.",
        "roadmap": [
            "1. Master data preprocessing: Imputing, Scaling (StandardScaler), Encoding (OneHotEncoder).",
            "2. Implement baseline models: Logistic Regression, Random Forests, K-Means, and SVM.",
            "3. Master Model evaluation (Cross-validation, Precision/Recall/F1, ROC-AUC) and Pipeline abstraction."
        ],
        "project_exercise": "Build an end-to-end text classification pipeline that classifies job descriptions into technical categories using TF-IDF and Logistic Regression.",
        "doc_url": "https://scikit-learn.org/stable/"
    },
    "CI/CD": {
        "explanation": "Continuous Integration and Continuous Deployment (CI/CD) automates building, testing, linting, and deploying code changes to ensure high software quality and fast release velocity.",
        "roadmap": [
            "1. Understand CI fundamentals: Automated testing on push and pull requests.",
            "2. Master GitHub Actions workflow files (`.github/workflows/`), actions, and secrets.",
            "3. Configure automated test runs, linting checks, and staging/production deployment pipelines."
        ],
        "project_exercise": "Configure a GitHub Actions workflow that runs backend unit tests, frontend build checks, and builds Docker images upon pull requests.",
        "doc_url": "https://docs.github.com/en/actions"
    },
    "AWS": {
        "explanation": "Amazon Web Services (AWS) is a comprehensive cloud platform providing scalable compute, storage, networking, database, and DevOps cloud services.",
        "roadmap": [
            "1. Learn core services: EC2 (Virtual Machines), S3 (Object Storage), RDS (Managed Databases).",
            "2. Master IAM (Roles, Policies, Security credentials) and VPC networking basics.",
            "3. Understand Serverless (AWS Lambda), API Gateway, and CloudFront CDN distribution."
        ],
        "project_exercise": "Deploy a containerized application to AWS using ECS/App Runner or EC2 connected to an RDS PostgreSQL instance and S3 bucket.",
        "doc_url": "https://docs.aws.amazon.com/"
    },
    "Kubernetes": {
        "explanation": "Kubernetes (K8s) is an open-source container orchestration system for automating application deployment, scaling, and management in production.",
        "roadmap": [
            "1. Understand core K8s architecture: Pods, Deployments, Services, ConfigMaps, and Secrets.",
            "2. Learn Ingress controllers, Persistent Volume Claims (PVC), and Resource Limits.",
            "3. Practice rolling updates, zero-downtime deployments, and horizontal pod autoscaling (HPA)."
        ],
        "project_exercise": "Write Kubernetes deployment manifests for a frontend and backend service with service discovery and health probes on Minikube or k3s.",
        "doc_url": "https://kubernetes.io/docs/home/"
    },
    "Tailwind CSS": {
        "explanation": "Tailwind CSS is a utility-first CSS framework packed with classes that can be composed to build modern, responsive custom user interfaces rapidly directly in markup.",
        "roadmap": [
            "1. Understand utility class structure for flexbox, grid, spacing, and typography.",
            "2. Master responsive design prefixes (sm:, md:, lg:) and dark mode variants.",
            "3. Learn custom theme configuration in tailwind.config.js and reusable component abstraction."
        ],
        "project_exercise": "Design a responsive SaaS analytics dashboard UI with interactive cards, state badges, and clean typography using Tailwind utility classes.",
        "doc_url": "https://tailwindcss.com/docs"
    },
    "Linux": {
        "explanation": "Linux is the predominant open-source operating system powering modern cloud servers, container runtimes, and developer environments.",
        "roadmap": [
            "1. Master fundamental shell commands: navigation, file manipulation, grep, find, awk, sed.",
            "2. Understand file permissions (chmod, chown), processes (ps, top, systemctl, kill), and SSH key management.",
            "3. Practice writing bash scripts for server automation and environment maintenance."
        ],
        "project_exercise": "Write a bash automation script that sets up a production Linux server environment, installs dependencies, and configures a systemd service.",
        "doc_url": "https://ubuntu.com/tutorials/command-line-for-beginners"
    },
}

def extract_text_from_pdf(file_obj) -> dict:
    """
    Safely extracts plain text from an uploaded PDF file stream using PyMuPDF (fitz).
    Returns a dict with:
    - 'success': bool
    - 'text': str
    - 'page_count': int
    - 'status': 'success' | 'empty' | 'encrypted' | 'corrupted' | 'unreadable'
    - 'message': str
    """
    try:
        # If file_obj is a Django UploadedFile or file-like object
        if hasattr(file_obj, 'read'):
            file_bytes = file_obj.read()
            # Reset seek position if possible
            if hasattr(file_obj, 'seek'):
                file_obj.seek(0)
            doc = fitz.open(stream=file_bytes, filetype="pdf")
        elif isinstance(file_obj, (bytes, bytearray)):
            doc = fitz.open(stream=file_obj, filetype="pdf")
        elif isinstance(file_obj, str):
            doc = fitz.open(file_obj)
        else:
            return {
                'success': False,
                'text': '',
                'page_count': 0,
                'status': 'corrupted',
                'message': 'Invalid file stream or format provided.'
            }

        if doc.is_encrypted:
            return {
                'success': False,
                'text': '',
                'page_count': len(doc),
                'status': 'encrypted',
                'message': 'This PDF file is password protected or encrypted. Please provide an unencrypted PDF.'
            }

        extracted_pages = []
        page_count = len(doc)

        for page_num in range(page_count):
            page = doc[page_num]
            page_text = page.get_text("text")
            if page_text:
                extracted_pages.append(page_text.strip())

        full_text = "\n\n".join(extracted_pages).strip()
        doc.close()

        if not full_text:
            return {
                'success': True,
                'text': '',
                'page_count': page_count,
                'status': 'empty',
                'message': 'No selectable text found in the PDF. If this is a scanned image, OCR is not supported in the initial version. Please upload a PDF with selectable text.'
            }

        return {
            'success': True,
            'text': full_text,
            'page_count': page_count,
            'status': 'success',
            'message': f'Successfully extracted text across {page_count} page(s).'
        }

    except fitz.FileDataError:
        return {
            'success': False,
            'text': '',
            'page_count': 0,
            'status': 'corrupted',
            'message': 'The uploaded PDF file is corrupted or not a valid PDF document.'
        }
    except Exception as e:
        return {
            'success': False,
            'text': '',
            'page_count': 0,
            'status': 'unreadable',
            'message': f'Failed to process PDF: {str(e)}'
        }


def extract_skills_from_text(text: str) -> list[str]:
    """
    Token and phrase-aware extraction of skills from plain text with alias normalization.
    Returns a sorted list of unique standardized skill names.
    """
    if not text or not isinstance(text, str):
        return []

    # Clean text and prepare normalized version for matching
    lowered_text = " " + text.lower() + " "
    # Replace common punctuation with spaces except +, #, ., / which are part of technical names
    normalized_text = re.sub(r'[,;:()\[\]{}"\'`!?]', ' ', lowered_text)

    found_skills = set()

    for standard_skill, aliases in SKILL_CATALOG.items():
        for alias in aliases:
            # Check if alias is already a regex pattern (e.g. \bc\b or \bgo\b)
            if alias.startswith(r'\b') or alias.startswith('^'):
                pattern = alias
            else:
                # Escape special characters in alias (like ++ or # or .)
                escaped_alias = re.escape(alias)
                # Word boundary check that respects technical symbols like C++, C#, .NET
                pattern = r'(?<![a-zA-Z0-9])' + escaped_alias + r'(?![a-zA-Z0-9])'

            if re.search(pattern, normalized_text, re.IGNORECASE):
                found_skills.add(standard_skill)
                break  # Stop checking other aliases for this skill once found

    return sorted(list(found_skills))


def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Calculates TF-IDF Vector Cosine Similarity between two text passages.
    Returns a float percentage between 0.0 and 100.0 rounded to 1 decimal place.
    """
    if not text1 or not text2:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(sim * 100.0), 1)
    except Exception:
        return 0.0


def get_learning_recommendation_for_skill(skill_name: str) -> dict:
    """
    Returns structured learning guidance and documentation URL for a missing skill.
    """
    if skill_name in LEARNING_RECOMMENDATIONS:
        data = LEARNING_RECOMMENDATIONS[skill_name]
        return {
            'skill': skill_name,
            'explanation': data['explanation'],
            'roadmap': data['roadmap'],
            'project_exercise': data['project_exercise'],
            'doc_url': data['doc_url']
        }

    # Fallback template for any other technical skill
    return {
        'skill': skill_name,
        'explanation': f"{skill_name} is a key technology requirement identified in the target job description.",
        'roadmap': [
            f"1. Read official documentation and guides for {skill_name}.",
            f"2. Build a standalone prototype demonstrating core {skill_name} fundamentals.",
            f"3. Integrate {skill_name} into a portfolio project and write automated tests."
        ],
        'project_exercise': f"Create a working proof-of-concept project implementing {skill_name} best practices.",
        'doc_url': f"https://devdocs.io/#q={skill_name.lower()}"
    }


def analyze_skill_gap(
    resume_skills: list[str],
    job_required_skills: list[str],
    job_preferred_skills: list[str] = None,
    resume_text: str = "",
    job_text: str = ""
) -> dict:
    """
    Performs comprehensive Skill Gap Analysis between Resume and Job Description.

    Formula:
    Match Score = (Matched Required Skills / Total Required Skills) * 100
    If no required skills are specified, match score is None/0 with clear explanation.
    """
    resume_set = set(resume_skills or [])
    required_set = set(job_required_skills or [])
    preferred_set = set(job_preferred_skills or [])

    matched_required = sorted(list(resume_set.intersection(required_set)))
    missing_required = sorted(list(required_set - resume_set))

    matched_preferred = sorted(list(resume_set.intersection(preferred_set)))
    missing_preferred = sorted(list(preferred_set - resume_set))

    # All matched skills combined
    all_job_skills = required_set.union(preferred_set)
    matched_all = sorted(list(resume_set.intersection(all_job_skills)))
    additional_skills = sorted(list(resume_set - all_job_skills))

    total_required_count = len(required_set)
    matched_required_count = len(matched_required)

    if total_required_count > 0:
        match_score = round((matched_required_count / total_required_count) * 100.0, 1)
        score_explanation = f"Matched {matched_required_count} of {total_required_count} required skill(s) ({match_score}%)."
    else:
        match_score = None
        score_explanation = "No specific required skills were specified in the job description to calculate a percentage."

    # Preferred match score if preferred skills exist
    if preferred_set:
        preferred_match_score = round((len(matched_preferred) / len(preferred_set)) * 100.0, 1)
    else:
        preferred_match_score = None

    # Textual TF-IDF cosine similarity
    text_similarity_score = calculate_text_similarity(resume_text, job_text)

    # Generate actionable learning recommendations for missing required skills (and top missing preferred)
    recommendations = []
    skills_to_recommend = missing_required + [s for s in missing_preferred if s not in missing_required]
    for skill in skills_to_recommend:
        recommendations.append(get_learning_recommendation_for_skill(skill))

    return {
        'match_score': match_score,
        'preferred_match_score': preferred_match_score,
        'text_similarity_score': text_similarity_score,
        'score_explanation': score_explanation,
        'total_required_count': total_required_count,
        'matched_required_count': matched_required_count,
        'missing_required_count': len(missing_required),
        'matched_skills': matched_all,
        'matched_required_skills': matched_required,
        'missing_required_skills': missing_required,
        'matched_preferred_skills': matched_preferred,
        'missing_preferred_skills': missing_preferred,
        'additional_skills': additional_skills,
        'recommendations': recommendations,
    }
