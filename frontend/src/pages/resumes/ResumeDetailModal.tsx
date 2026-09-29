import React from 'react';
import { Resume } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { SkillBadge } from '../../components/ui/SkillBadge';
import { FileText, Calendar, Layers, HardDrive } from 'lucide-react';

interface ResumeDetailModalProps {
  resume: Resume | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeDetailModal: React.FC<ResumeDetailModalProps> = ({
  resume,
  isOpen,
  onClose,
}) => {
  if (!resume) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={resume.original_filename}
      subtitle={`Uploaded on ${new Date(resume.created_at).toLocaleDateString()}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Metadata summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-brand-600" />
            <div>
              <p className="text-2xs text-slate-500 uppercase font-semibold">Pages</p>
              <p className="text-sm font-bold text-slate-800">{resume.page_count}</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-brand-600" />
            <div>
              <p className="text-2xs text-slate-500 uppercase font-semibold">Size</p>
              <p className="text-sm font-bold text-slate-800">{formatFileSize(resume.file_size)}</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-brand-600" />
            <div>
              <p className="text-2xs text-slate-500 uppercase font-semibold">Skills Found</p>
              <p className="text-sm font-bold text-slate-800">{resume.skill_count}</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-brand-600" />
            <div>
              <p className="text-2xs text-slate-500 uppercase font-semibold">Status</p>
              <p className="text-sm font-bold text-emerald-600 capitalize">{resume.status}</p>
            </div>
          </div>
        </div>

        {/* Extracted Skills */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Identified Technical Skills ({resume.extracted_skills.length})
          </h4>
          {resume.extracted_skills && resume.extracted_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {resume.extracted_skills.map((skill) => (
                <SkillBadge key={skill} skill={skill} type="matched" size="sm" />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {resume.status === 'empty'
                ? 'No selectable text found in the PDF. If this is a scanned image, OCR is not supported in the initial version.'
                : 'No standard skills detected.'}
            </p>
          )}
        </div>

        {/* Extracted Text Viewer */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Extracted Plain Text (via PyMuPDF)
          </h4>
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {resume.extracted_text || 'No text extracted.'}
          </div>
        </div>
      </div>
    </Modal>
  );
};
