export interface UserProfile {
  headline: string;
  target_role: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'lead';
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: UserProfile;
  date_joined?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message?: string;
}

export interface Resume {
  id: number;
  original_filename: string;
  file: string;
  file_size: number;
  extracted_text: string;
  extracted_skills: string[];
  skill_count: number;
  page_count: number;
  status: 'processing' | 'completed' | 'empty' | 'encrypted' | 'failed';
  status_message: string;
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: number;
  title: string;
  company: string;
  location: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote';
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  job_url: string;
  salary_range: string;
  auto_extracted_skills?: string[];
  created_at: string;
  updated_at: string;
}

export interface LearningRecommendation {
  skill: string;
  explanation: string;
  roadmap: string[];
  project_exercise: string;
  doc_url: string;
}

export interface SkillAnalysis {
  id: number;
  resume?: number;
  job?: number;
  resume_title: string;
  job_title: string;
  company_name: string;
  match_score: number | null;
  preferred_match_score: number | null;
  text_similarity_score: number;
  score_explanation: string;
  matched_skills: string[];
  missing_skills: string[];
  additional_skills: string[];
  recommendations: LearningRecommendation[];
  created_at: string;
}

export type ApplicationStatus = 'wishlist' | 'applied' | 'assessment' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

export interface JobApplication {
  id: number;
  job?: number | null;
  job_details?: JobDescription | null;
  company: string;
  role_title: string;
  status: ApplicationStatus;
  status_display?: string;
  applied_date: string;
  interview_date?: string | null;
  offer_deadline?: string | null;
  salary_offered?: string;
  location?: string;
  job_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsOverview {
  total_applications: number;
  interview_count: number;
  offer_count: number;
  rejection_count: number;
  wishlist_count: number;
  applied_count: number;
  assessment_count: number;
  total_resumes: number;
  total_jobs: number;
  total_analyses: number;
  average_match_score: number | null;
  recent_applications: Array<{
    id: number;
    company: string;
    role_title: string;
    status: ApplicationStatus;
    applied_date: string;
    location: string;
  }>;
  recent_analyses: Array<{
    id: number;
    job_title: string;
    company_name: string;
    resume_title: string;
    match_score: number | null;
    text_similarity_score: number;
    created_at: string;
  }>;
}

export interface AnalyticsApplications {
  total_count: number;
  status_breakdown: Array<{
    status: string;
    key: string;
    count: number;
    color: string;
  }>;
  timeline: Array<{
    date: string;
    count: number;
  }>;
}

export interface AnalyticsSkills {
  top_missing_skills: Array<{
    skill: string;
    frequency: number;
  }>;
  top_matched_skills: Array<{
    skill: string;
    frequency: number;
  }>;
  match_score_distribution: Array<{
    range: string;
    count: number;
  }>;
  total_analyses_evaluated: number;
}
