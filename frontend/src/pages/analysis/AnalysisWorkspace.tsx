import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resumesApi } from '../../api/resumes';
import { jobsApi } from '../../api/jobs';
import { analysesApi } from '../../api/analyses';
import { Resume, JobDescription, SkillAnalysis } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SkillBadge } from '../../components/ui/SkillBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  Target,
  Sparkles,
  CheckCircle2,
  XCircle,
  PlusCircle,
  BookOpen,
  ExternalLink,
  Layers,
  FileText,
  Briefcase,
  History,
  Info,
  CheckSquare,
} from 'lucide-react';

export const AnalysisWorkspace: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedJobId = searchParams.get('job_id');
  const preSelectedResumeId = searchParams.get('resume_id');

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [pastAnalyses, setPastAnalyses] = useState<SkillAnalysis[]>([]);

  const [selectedResumeId, setSelectedResumeId] = useState<number | ''>(
    preSelectedResumeId ? parseInt(preSelectedResumeId) : ''
  );
  const [selectedJobId, setSelectedJobId] = useState<number | ''>(
    preSelectedJobId ? parseInt(preSelectedJobId) : ''
  );

  const [currentAnalysis, setCurrentAnalysis] = useState<SkillAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { success, error, info } = useToast();

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [resData, jobsData, analysesData] = await Promise.all([
          resumesApi.list(),
          jobsApi.list(),
          analysesApi.list(),
        ]);

        const rList = resData.results || [];
        const jList = jobsData.results || [];
        const aList = analysesData.results || [];

        setResumes(rList);
        setJobs(jList);
        setPastAnalyses(aList);

        if (!selectedResumeId && rList.length > 0) {
          setSelectedResumeId(rList[0].id);
        }
        if (!selectedJobId && jList.length > 0) {
          setSelectedJobId(jList[0].id);
        }

        // If there are existing analyses, load the latest one as default preview
        if (aList.length > 0 && !preSelectedJobId && !preSelectedResumeId) {
          setCurrentAnalysis(aList[0]);
        }
      } catch {
        error('Failed to load analysis prerequisites.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPrerequisites();
  }, []);

  const handleRunAnalysis = async () => {
    if (!selectedResumeId || !selectedJobId) {
      error('Please select both a resume and a job description.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analysesApi.create({
        resume_id: Number(selectedResumeId),
        job_id: Number(selectedJobId),
      });

      setCurrentAnalysis(result);
      setPastAnalyses((prev) => [result, ...prev]);
      success(`Analysis complete! Score: ${result.match_score ?? 0}%`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Analysis failed.';
      error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading analyzer workspace..." />;
  }

  if (resumes.length === 0 || jobs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Skill Gap Analyzer</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Compare your resume skills against target job descriptions to identify missing technical requirements.
          </p>
        </div>

        <Card padding="lg" className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">Prerequisites Required</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            To perform skill gap analysis, you need at least one uploaded PDF resume and one saved job description.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {resumes.length === 0 && (
              <Link to="/resumes">
                <Button icon={<FileText className="w-4 h-4" />}>Upload Resume</Button>
              </Link>
            )}
            {jobs.length === 0 && (
              <Link to="/jobs">
                <Button variant="secondary" icon={<Briefcase className="w-4 h-4" />}>
                  Add Job Description
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Skill Gap Analyzer & Roadmap</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Select a resume and job description to calculate transparent match scores and actionable learning roadmaps.
        </p>
      </div>

      {/* Selector Control Card */}
      <Card padding="md" className="border-brand-100 bg-gradient-to-b from-brand-50/20 to-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              Select Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white shadow-2xs font-medium"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.original_filename} ({r.skill_count} skills)
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-brand-600" />
              Select Target Job Description
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white shadow-2xs font-medium"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} @ {j.company} ({j.required_skills?.length || 0} req)
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <Button
              onClick={handleRunAnalysis}
              isLoading={isAnalyzing}
              className="w-full py-2.5"
              icon={<Target className="w-4 h-4" />}
            >
              Analyze Match
            </Button>
          </div>
        </div>
      </Card>

      {/* Analysis Results View */}
      {currentAnalysis ? (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Required Match Percentage Card */}
            <Card padding="md" className="flex flex-col justify-between border-brand-200 bg-gradient-to-br from-white to-brand-50/40">
              <div>
                <span className="text-2xs font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Required Skill Match
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {currentAnalysis.match_score !== null ? `${currentAnalysis.match_score}%` : 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {currentAnalysis.score_explanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-2xs text-slate-500">
                <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>Formula: (Matched Required / Total Required) × 100</span>
              </div>
            </Card>

            {/* Textual Semantic Similarity Card */}
            <Card padding="md" className="flex flex-col justify-between">
              <div>
                <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Text Similarity Metric
                </span>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-slate-800">
                    {currentAnalysis.text_similarity_score}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  TF-IDF Cosine textual overlap between resume document and job description wording.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-2xs text-slate-400">
                * Textual metric only. Does not represent hiring probability.
              </div>
            </Card>

            {/* Overview Summary Counts */}
            <Card padding="md" className="flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Skill Breakdown
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matched Skills
                    </span>
                    <span className="font-bold">{currentAnalysis.matched_skills?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200/60">
                    <span className="flex items-center gap-1.5 font-medium">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Missing Required
                    </span>
                    <span className="font-bold">{currentAnalysis.missing_skills?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/60">
                    <span className="flex items-center gap-1.5 font-medium">
                      <PlusCircle className="w-3.5 h-3.5 text-sky-600" /> Additional Skills
                    </span>
                    <span className="font-bold">{currentAnalysis.additional_skills?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between text-2xs text-slate-400">
                <span>Evaluated for {currentAnalysis.company_name}</span>
              </div>
            </Card>
          </div>

          {/* Skill Badges Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Matched Skills */}
            <Card
              title="Matched Skills"
              subtitle="Present in your resume"
              padding="md"
            >
              {currentAnalysis.matched_skills && currentAnalysis.matched_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.matched_skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} type="matched" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No matching skills found.</p>
              )}
            </Card>

            {/* Missing Skills */}
            <Card
              title="Missing Required Skills"
              subtitle="Requested by job but missing from resume"
              padding="md"
            >
              {currentAnalysis.missing_skills && currentAnalysis.missing_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.missing_skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} type="missing" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 font-medium">
                  🎉 Fantastic! You have all required skills listed for this role.
                </p>
              )}
            </Card>

            {/* Additional Skills */}
            <Card
              title="Additional Resume Skills"
              subtitle="Skills in your resume not requested by this role"
              padding="md"
            >
              {currentAnalysis.additional_skills && currentAnalysis.additional_skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.additional_skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} type="additional" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No extra skills detected.</p>
              )}
            </Card>
          </div>

          {/* Actionable Learning Roadmaps for Missing Skills */}
          {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
            <Card
              title="Curated Learning Roadmap & Project Exercises"
              subtitle="Step-by-step guidance & official documentation for missing skills"
              padding="md"
            >
              <div className="space-y-4">
                {currentAnalysis.recommendations.map((rec) => (
                  <div
                    key={rec.skill}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SkillBadge skill={rec.skill} type="missing" />
                        <span className="text-xs font-semibold text-slate-800">Learning Plan</span>
                      </div>
                      {rec.doc_url && (
                        <a
                          href={rec.doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        >
                          Official Documentation <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{rec.explanation}</p>

                    {/* Step-by-step roadmap */}
                    {rec.roadmap && rec.roadmap.length > 0 && (
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/60">
                        <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-brand-600" /> Recommended Learning Steps
                        </p>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {rec.roadmap.map((step, idx) => (
                            <li key={idx} className="leading-snug">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Project Exercise */}
                    {rec.project_exercise && (
                      <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200/60 text-xs">
                        <span className="font-semibold text-brand-900 block mb-0.5">
                          💡 Portfolio Project Idea:
                        </span>
                        <p className="text-brand-800 text-2xs leading-relaxed">{rec.project_exercise}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card padding="lg" className="text-center py-10">
          <p className="text-xs text-slate-500">Select a resume and job above, then click "Analyze Match" to generate report.</p>
        </Card>
      )}

      {/* Past Analyses History */}
      {pastAnalyses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            Previous Analyses ({pastAnalyses.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pastAnalyses.map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentAnalysis(item)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  currentAnalysis?.id === item.id
                    ? 'border-brand-500 bg-brand-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                    {item.job_title}
                  </h4>
                  <span className="text-xs font-bold text-brand-600">
                    {item.match_score !== null ? `${item.match_score}%` : 'N/A'}
                  </span>
                </div>
                <p className="text-2xs text-slate-500 mt-0.5">{item.company_name}</p>
                <p className="text-2xs text-slate-400 mt-1">
                  Resume: {item.resume_title} • {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
