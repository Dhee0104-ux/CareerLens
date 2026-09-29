import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../api/jobs';
import { JobDescription } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkillBadge } from '../../components/ui/SkillBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { JobCreateEditModal } from './JobCreateEditModal';
import { useToast } from '../../context/ToastContext';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Edit2,
  Trash2,
  ExternalLink,
  Target,
} from 'lucide-react';

export const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobDescription | null>(null);
  const { success, error } = useToast();

  const fetchJobs = async (search?: string) => {
    try {
      const data = await jobsApi.list(search);
      setJobs(data.results || []);
    } catch {
      error('Failed to load job descriptions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    fetchJobs(searchQuery);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job description?')) return;
    try {
      await jobsApi.delete(id);
      success('Job description deleted.');
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch {
      error('Failed to delete job description.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Target Job Descriptions</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Maintain job descriptions, required technical skills, and compare them against your resumes.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Job Description
        </Button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role title, company, or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      {/* Jobs Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading job descriptions..." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="No job descriptions found"
          description="Add a target job description by pasting the job post text to automatically extract requirements."
          actionLabel="Add Job Description"
          onAction={() => {
            setEditingJob(null);
            setIsModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} padding="md" className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-xs font-medium text-brand-600 mt-0.5">{job.company}</p>
                  </div>
                  <Badge variant="brand" size="sm" className="capitalize">
                    {job.employment_type.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Location & Salary */}
                <div className="flex flex-wrap items-center gap-3 text-2xs text-slate-500 mt-2 mb-3">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location}
                    </span>
                  )}
                  {job.salary_range && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      {job.salary_range}
                    </span>
                  )}
                </div>

                {/* Required Skills Chips */}
                <div className="mt-3">
                  <p className="text-2xs font-semibold uppercase text-slate-400 mb-1.5">
                    Required Skills ({job.required_skills?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {job.required_skills && job.required_skills.length > 0 ? (
                      job.required_skills.slice(0, 8).map((skill) => (
                        <SkillBadge key={skill} skill={skill} type="default" size="sm" />
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No skills specified</span>
                    )}
                    {job.required_skills && job.required_skills.length > 8 && (
                      <span className="text-2xs text-slate-500 font-medium self-center px-1">
                        +{job.required_skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link to={`/analysis?job_id=${job.id}`}>
                  <Button size="sm" variant="outline" icon={<Target className="w-3.5 h-3.5" />}>
                    Match Resume
                  </Button>
                </Link>

                <div className="flex items-center gap-1">
                  {job.job_url && (
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Open Job Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setEditingJob(job);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <JobCreateEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        jobToEdit={editingJob}
        onSaved={() => fetchJobs(searchQuery)}
      />
    </div>
  );
};
