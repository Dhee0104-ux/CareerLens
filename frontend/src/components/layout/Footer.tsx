import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
      <p>© {new Date().getFullYear()} CareerLens — Smart Job Application & Skill Gap Analyzer. Built for engineering job seekers.</p>
    </footer>
  );
};
