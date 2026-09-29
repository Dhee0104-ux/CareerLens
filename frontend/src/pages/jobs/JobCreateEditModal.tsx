import React, { useState, useEffect } from 'react';
import { JobDescription } from '../../types';
import { jobsApi } from '../../api/jobs';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { SkillBadge } from '../../components/ui/SkillBadge';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Plus, X, Briefcase } from 'lucide-react';

interface JobCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: JobDescription | null;
  onSaved: (job: JobDescription) => void;
}

export const JobCreateEditModal: React.FC<JobCreateEditModalProps> = ({
  isOpen,
  onClose,
  jobToEdit,
  onSaved,
}) => {
  const [formData, setFormData] = useState<Partial<JobDescription>>({
    title: '',
    company: '',
    location: '',
    employment_type: 'full_time',
    description: '',
    required_skills: [],
    preferred_skills: [],
    job_url: '',
    salary_range: '',
  });

  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error, info } = useToast();

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title,
        company: jobToEdit.company,
        location: jobToEdit.location || '',
        employment_type: jobToEdit.employment_type,
        description: jobToEdit.description,
        required_skills: jobToEdit.required_skills || [],
        preferred_skills: jobToEdit.preferred_skills || [],
        job_url: jobToEdit.job_url || '',
        salary_range: jobToEdit.salary_range || '',
      });
    } else {
      setFormData({
        title: '',
        company: '',
        location: '',
        employment_type: 'full_time',
        description: '',
        required_skills: [],
        preferred_skills: [],
        job_url: '',
        salary_range: '',
      });
    }
  }, [jobToEdit, isOpen]);

  const handleExtractFromDescription = async () => {
    if (!formData.description) {
      error('Please paste a job description first.');
      return;
    }

    setIsExtracting(true);
    try {
      const res = await jobsApi.extractPreview(formData.description);
      if (res.skills && res.skills.length > 0) {
        // Merge with existing skills uniquely
        const currentReq = formData.required_skills || [];
        const merged = Array.from(new Set([...currentReq, ...res.skills]));
        setFormData((prev) => ({ ...prev, required_skills: merged }));
        success(`Identified ${res.skills.length} technical skills in the job description!`);
      } else {
        info('No standard technical skills detected in the pasted text.');
      }
    } catch {
      error('Failed to extract skills.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddRequiredSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const skill = newRequiredSkill.trim();
    if (!skill) return;
    if (formData.required_skills?.includes(skill)) {
      setNewRequiredSkill('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      required_skills: [...(prev.required_skills || []), skill],
    }));
    setNewRequiredSkill('');
  };

  const handleRemoveRequiredSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills?.filter((s) => s !== skillToRemove) || [],
    }));
  };

  const handleAddPreferredSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const skill = newPreferredSkill.trim();
    if (!skill) return;
    if (formData.preferred_skills?.includes(skill)) {
      setNewPreferredSkill('');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      preferred_skills: [...(prev.preferred_skills || []), skill],
    }));
    setNewPreferredSkill('');
  };

  const handleRemovePreferredSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_skills: prev.preferred_skills?.filter((s) => s !== skillToRemove) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.description) {
      error('Please fill in Job Title, Company, and Job Description.');
      return;
    }

    setIsSaving(true);
    try {
      let saved: JobDescription;
      if (jobToEdit) {
        saved = await jobsApi.update(jobToEdit.id, formData);
        success('Job description updated!');
      } else {
        saved = await jobsApi.create(formData);
        success('Job description saved!');
      }
      onSaved(saved);
      onClose();
    } catch (err: any) {
      error('Failed to save job description.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={jobToEdit ? 'Edit Job Description' : 'Add New Job Description'}
      subtitle="Paste job requirements to analyze skill match percentages"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Full Stack Engineer"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Company *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Stripe, Acme Corp"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Employment Type
            </label>
            <select
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            >
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. San Francisco / Remote"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Salary / Compensation
            </label>
            <input
              type="text"
              value={formData.salary_range}
              onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
              placeholder="e.g. $120k - $150k"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Job Description Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Job Description *
            </label>
            <button
              type="button"
              onClick={handleExtractFromDescription}
              disabled={isExtracting || !formData.description}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isExtracting ? 'Scanning skills...' : 'Auto-Extract Skills'}
            </button>
          </div>
          <textarea
            required
            rows={5}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Paste the full job post text here..."
            className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 leading-relaxed font-sans"
          />
        </div>

        {/* Required Skills Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Required Skills ({formData.required_skills?.length || 0})
          </label>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 min-h-[48px] mb-2">
            {formData.required_skills && formData.required_skills.length > 0 ? (
              formData.required_skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-lg"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveRequiredSkill(skill)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 self-center">
                Click "Auto-Extract Skills" or add custom skills below.
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRequiredSkill}
              onChange={(e) => setNewRequiredSkill(e.target.value)}
              placeholder="Add skill (e.g. Docker, PostgreSQL)"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddRequiredSkill}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Preferred Skills Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Preferred / Bonus Skills ({formData.preferred_skills?.length || 0})
          </label>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 min-h-[48px] mb-2">
            {formData.preferred_skills && formData.preferred_skills.length > 0 ? (
              formData.preferred_skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemovePreferredSkill(skill)}
                    className="hover:text-rose-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 self-center">Optional preferred skills.</span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPreferredSkill}
              onChange={(e) => setNewPreferredSkill(e.target.value)}
              placeholder="Add preferred skill (e.g. GraphQL, Next.js)"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddPreferredSkill}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {jobToEdit ? 'Save Changes' : 'Create Job Description'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
