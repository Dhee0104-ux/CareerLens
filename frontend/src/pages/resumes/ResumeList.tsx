import React, { useState, useEffect, useRef } from 'react';
import { resumesApi } from '../../api/resumes';
import { Resume } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkillBadge } from '../../components/ui/SkillBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ResumeDetailModal } from './ResumeDetailModal';
import { useToast } from '../../context/ToastContext';
import {
  UploadCloud,
  FileText,
  Trash2,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const ResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error, info } = useToast();

  const fetchResumes = async () => {
    try {
      const data = await resumesApi.list();
      setResumes(data.results || []);
    } catch (err) {
      error('Failed to load resumes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      error('Only PDF documents are supported. Please upload a .pdf file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const newResume = await resumesApi.upload(file, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });
      success(`Successfully uploaded "${newResume.original_filename}"! Extracted ${newResume.skill_count} skills.`);
      setResumes((prev) => [newResume, ...prev]);
    } catch (err: any) {
      const msg = err.response?.data?.file?.[0] || err.response?.data?.error || 'Failed to upload and parse PDF.';
      error(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReprocess = async (id: number) => {
    try {
      info('Reprocessing PDF text and skills...');
      const updated = await resumesApi.reprocess(id);
      success('Resume reprocessed successfully!');
      setResumes((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      error('Reprocessing failed.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await resumesApi.delete(id);
      success('Resume deleted.');
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch {
      error('Failed to delete resume.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload PDF resumes to extract text, identify technical skills, and use in skill gap matching.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all duration-200 ${
          isDragging
            ? 'border-brand-500 bg-brand-50/50 scale-[1.005]'
            : 'border-slate-200 bg-white hover:border-brand-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1">
          {isUploading ? 'Uploading & Parsing PDF...' : 'Drag & Drop your Resume PDF here'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
          Supports standard PDF files with selectable text up to 5MB. PyMuPDF automatically parses skills and formatting.
        </p>

        {isUploading ? (
          <div className="max-w-xs mx-auto">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress || 60}%` }}
              />
            </div>
            <p className="text-2xs text-slate-500 font-medium">Extracting text & identifying skills...</p>
          </div>
        ) : (
          <Button
            onClick={() => fileInputRef.current?.click()}
            icon={<FileText className="w-4 h-4" />}
          >
            Select PDF File
          </Button>
        )}
      </div>

      {/* Resume Cards / List */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span>Uploaded Resumes</span>
          <span className="text-xs text-slate-500 font-normal">({resumes.length})</span>
        </h2>

        {isLoading ? (
          <LoadingSpinner message="Loading your resumes..." />
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8" />}
            title="No resumes uploaded yet"
            description="Upload your PDF resume above to view detected skills and run match gap analyses."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((resume) => (
              <Card key={resume.id} padding="md" className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1">
                          {resume.original_filename}
                        </h4>
                        <p className="text-2xs text-slate-500 mt-0.5">
                          {new Date(resume.created_at).toLocaleDateString()} • {resume.page_count} page(s)
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        resume.status === 'completed'
                          ? 'success'
                          : resume.status === 'empty'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {resume.status}
                    </Badge>
                  </div>

                  {/* Skills Preview */}
                  <div className="mt-3">
                    <p className="text-2xs font-semibold uppercase text-slate-400 mb-2">
                      Extracted Skills ({resume.skill_count})
                    </p>
                    {resume.extracted_skills && resume.extracted_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {resume.extracted_skills.slice(0, 10).map((skill) => (
                          <SkillBadge key={skill} skill={skill} type="matched" size="sm" />
                        ))}
                        {resume.extracted_skills.length > 10 && (
                          <span className="text-2xs text-slate-500 font-medium self-center px-1">
                            +{resume.extracted_skills.length - 10} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No skills detected.</p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedResume(resume);
                        setIsModalOpen(true);
                      }}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Inspect
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReprocess(resume.id)}
                      icon={<RefreshCw className="w-3.5 h-3.5" />}
                      title="Reprocess text & skill catalog"
                    >
                      Reprocess
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    onClick={() => handleDelete(resume.id)}
                    icon={<Trash2 className="w-3.5 h-3.5" />}
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ResumeDetailModal
        resume={selectedResume}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
