import React, { useState, useEffect } from 'react';
import { JobApplication, JobDescription, ApplicationStatus } from '../../types';
import { applicationsApi } from '../../api/applications';
import { jobsApi } from '../../api/jobs';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appToEdit?: JobApplication | null;
  onSaved: (app: JobApplication) => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  appToEdit,
  onSaved,
}) => {
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    company: '',
    role_title: '',
    status: 'applied',
    applied_date: new Date().toISOString().split('T')[0],
    interview_date: '',
    offer_deadline: '',
    salary_offered: '',
    location: '',
    job_url: '',
    notes: '',
    job: null,
  });

  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      jobsApi.list().then((res) => setJobs(res.results || [])).catch(() => {});
    }

    if (appToEdit) {
      setFormData({
        company: appToEdit.company,
        role_title: appToEdit.role_title,
        status: appToEdit.status,
        applied_date: appToEdit.applied_date || new Date().toISOString().split('T')[0],
        interview_date: appToEdit.interview_date ? appToEdit.interview_date.slice(0, 16) : '',
        offer_deadline: appToEdit.offer_deadline || '',
        salary_offered: appToEdit.salary_offered || '',
        location: appToEdit.location || '',
        job_url: appToEdit.job_url || '',
        notes: appToEdit.notes || '',
        job: appToEdit.job || null,
      });
    } else {
      setFormData({
        company: '',
        role_title: '',
        status: 'applied',
        applied_date: new Date().toISOString().split('T')[0],
        interview_date: '',
        offer_deadline: '',
        salary_offered: '',
        location: '',
        job_url: '',
        notes: '',
        job: null,
      });
    }
  }, [appToEdit, isOpen]);

  const handleJobSelect = (jobId: string) => {
    if (!jobId) {
      setFormData((prev) => ({ ...prev, job: null }));
      return;
    }
    const selected = jobs.find((j) => j.id === Number(jobId));
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        job: selected.id,
        company: selected.company,
        role_title: selected.title,
        location: selected.location || prev.location,
        job_url: selected.job_url || prev.job_url,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role_title) {
      error('Please specify company and role title.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        interview_date: formData.interview_date || null,
        offer_deadline: formData.offer_deadline || null,
      };

      let saved: JobApplication;
      if (appToEdit) {
        saved = await applicationsApi.update(appToEdit.id, payload);
        success('Application updated!');
      } else {
        saved = await applicationsApi.create(payload);
        success('Application created!');
      }
      onSaved(saved);
      onClose();
    } catch {
      error('Failed to save application.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={appToEdit ? 'Edit Application' : 'Log New Application'}
      subtitle="Track pipeline status, interview dates, and notes"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {jobs.length > 0 && !appToEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Link with Existing Job Description (Optional)
            </label>
            <select
              value={formData.job || ''}
              onChange={(e) => handleJobSelect(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            >
              <option value="">-- Choose Job Description to Autofill --</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} @ {j.company}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Company *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Microsoft"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Role Title *
            </label>
            <input
              type="text"
              required
              value={formData.role_title}
              onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
              placeholder="e.g. Software Engineer"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            >
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="assessment">Assessment / Coding Test</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer Received</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Applied Date
            </label>
            <input
              type="date"
              value={formData.applied_date}
              onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Interview Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.interview_date || ''}
              onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Offer Deadline (Optional)
            </label>
            <input
              type="date"
              value={formData.offer_deadline || ''}
              onChange={(e) => setFormData({ ...formData, offer_deadline: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Austin, TX or Remote"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Offered Salary / Range
            </label>
            <input
              type="text"
              value={formData.salary_offered}
              onChange={(e) => setFormData({ ...formData, salary_offered: e.target.value })}
              placeholder="e.g. $135,000 / yr"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Job URL
          </label>
          <input
            type="url"
            value={formData.job_url}
            onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
            placeholder="https://jobs.company.com/..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Interview Notes & Preparation
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Key talking points, recruiter name, interview rounds..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {appToEdit ? 'Update Application' : 'Save Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
