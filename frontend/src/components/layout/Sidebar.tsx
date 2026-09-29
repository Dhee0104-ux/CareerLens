import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Crosshair,
  KanbanSquare,
  BarChart3,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/analysis', label: 'Skill Gap Analyzer', icon: <Crosshair className="w-5 h-5" /> },
    { to: '/resumes', label: 'Resumes & Skills', icon: <FileText className="w-5 h-5" /> },
    { to: '/jobs', label: 'Job Descriptions', icon: <Briefcase className="w-5 h-5" /> },
    { to: '/applications', label: 'Application Tracker', icon: <KanbanSquare className="w-5 h-5" /> },
    { to: '/analytics', label: 'Analytics & Trends', icon: <BarChart3 className="w-5 h-5" /> },
    { to: '/profile', label: 'Profile & Career Goals', icon: <UserCheck className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 p-4 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-1">
          <p className="px-3 text-2xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Pro Tip Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            CareerLens Engine
          </p>
          <p className="text-slate-500 leading-relaxed text-2xs">
            Upload selectable PDF resumes to extract 100+ standard skills and compute transparent match scores.
          </p>
        </div>
      </aside>
    </>
  );
};
