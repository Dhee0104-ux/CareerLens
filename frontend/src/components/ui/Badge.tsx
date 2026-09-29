import React from 'react';
import { ApplicationStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
}) => {
  const variants = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    info: 'bg-sky-50 text-sky-700 border-sky-200/80',
    gray: 'bg-slate-100 text-slate-700 border-slate-200/80',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ApplicationStatus | string }> = ({ status }) => {
  const statusMap: Record<string, { label: string; variant: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'gray' }> = {
    wishlist: { label: 'Wishlist', variant: 'gray' },
    applied: { label: 'Applied', variant: 'brand' },
    assessment: { label: 'Assessment', variant: 'info' },
    interview: { label: 'Interview', variant: 'warning' },
    offer: { label: 'Offer Received', variant: 'success' },
    rejected: { label: 'Rejected', variant: 'danger' },
    withdrawn: { label: 'Withdrawn', variant: 'gray' },
  };

  const item = statusMap[status.toLowerCase()] || { label: status, variant: 'gray' };

  return <Badge variant={item.variant}>{item.label}</Badge>;
};
