import React from 'react';
import { Check, X, Plus } from 'lucide-react';

interface SkillBadgeProps {
  skill: string;
  type?: 'matched' | 'missing' | 'additional' | 'default';
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  type = 'default',
  onClick,
  size = 'md',
}) => {
  const styles = {
    matched: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
    missing: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100',
    additional: 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100',
    default: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
  };

  const icons = {
    matched: <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />,
    missing: <X className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />,
    additional: <Plus className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />,
    default: null,
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1 gap-1',
    md: 'text-xs sm:text-sm px-3 py-1.5 gap-1.5',
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-medium rounded-xl border transition-colors shadow-2xs ${
        styles[type]
      } ${sizes[size]} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {icons[type]}
      <span>{skill}</span>
    </span>
  );
};
