import React, { useState, useEffect } from 'react';
import { applicationsApi } from '../../api/applications';
import { JobApplication, ApplicationStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ApplicationModal } from './ApplicationModal';
import { useToast } from '../../context/ToastContext';
import { useLiveSimulation } from '../../context/LiveSimulationContext';
import {
  KanbanSquare,
  ListFilter,
  Plus,
  Search,
  Calendar,
  Building,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Columns,
  Table as TableIcon,
  Clock,
  Database,
  RefreshCw,
} from 'lucide-react';

const KANBAN_COLUMNS: Array<{ key: ApplicationStatus; label: string; color: string }> = [
  { key: 'wishlist', label: 'Wishlist', color: 'border-slate-300 bg-slate-50' },
  { key: 'applied', label: 'Applied', color: 'border-brand-300 bg-brand-50/40' },
  { key: 'assessment', label: 'Assessment', color: 'border-purple-300 bg-purple-50/40' },
  { key: 'interview', label: 'Interview', color: 'border-amber-300 bg-amber-50/40' },
  { key: 'offer', label: 'Offer', color: 'border-emerald-300 bg-emerald-50/40' },
  { key: 'rejected', label: 'Rejected', color: 'border-rose-300 bg-rose-50/40' },
];

export const ApplicationTracker: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const { success, error } = useToast();
  const { refreshKey, seedDemoData, isSeeding } = useLiveSimulation();

  const fetchApplications = async () => {
    try {
      const data = await applicationsApi.list(selectedStatus, searchQuery);
      setApplications(data.results || []);
    } catch {
      error('Failed to load applications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, refreshKey]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleStatusChange = async (appId: number, newStatus: ApplicationStatus) => {
    try {
      const updated = await applicationsApi.updateStatus(appId, newStatus);
      setApplications((prev) => prev.map((a) => (a.id === appId ? updated : a)));
      success(`Status moved to ${updated.status_display || newStatus}!`);
    } catch {
      error('Failed to update status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this application entry?')) return;
    try {
      await applicationsApi.delete(id);
      success('Application deleted.');
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      error('Failed to delete application.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Application Pipeline</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track interview dates, coding assessments, offers, and manage job statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table
            </button>
          </div>

            <Button
              onClick={seedDemoData}
              disabled={isSeeding}
              variant="secondary"
              icon={isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 text-emerald-600" />}
            >
              {isSeeding ? 'Seeding...' : 'Seed Sample Pipeline'}
            </Button>

            <Button
              onClick={() => {
                setEditingApp(null);
                setIsModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Log Application
            </Button>
          </div>
        </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, role, location, or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="all">All Pipeline Stages</option>
            <option value="wishlist">Wishlist</option>
            <option value="applied">Applied</option>
            <option value="assessment">Assessment</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading application pipeline..." />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<KanbanSquare className="w-8 h-8" />}
          title="No applications tracked yet"
          description="Log your job applications here to manage interview rounds, statuses, and deadlines."
          actionLabel="Log First Application"
          onAction={() => {
            setEditingApp(null);
            setIsModalOpen(true);
          }}
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-6">
          {KANBAN_COLUMNS.map((col) => {
            const colApps = applications.filter((a) => a.status === col.key);
            return (
              <div
                key={col.key}
                className={`rounded-2xl border p-3 min-h-[500px] flex flex-col ${col.color}`}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80">
                  <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                    {col.label}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
                    {colApps.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="font-semibold text-slate-900 leading-snug line-clamp-1">
                            {app.role_title}
                          </h4>
                          <p className="text-2xs font-medium text-brand-600 mt-0.5">{app.company}</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingApp(app);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>

                      {app.location && (
                        <p className="text-2xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {app.location}
                        </p>
                      )}

                      {app.interview_date && (
                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-2xs flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <span>Interview: {new Date(app.interview_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}

                      {/* Status quick mover */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                          className="text-2xs py-0.5 px-1.5 rounded bg-slate-50 border border-slate-200 text-slate-600 focus:outline-none"
                        >
                          <option value="wishlist">Wishlist</option>
                          <option value="applied">Applied</option>
                          <option value="assessment">Assessment</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Company & Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Interview Date</th>
                  <th className="px-6 py-3.5">Location / Salary</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 text-sm">{app.role_title}</p>
                      <p className="text-2xs text-brand-600 mt-0.5">{app.company}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-600">{app.applied_date}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {app.interview_date ? new Date(app.interview_date).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <p>{app.location || '—'}</p>
                      {app.salary_offered && <p className="text-2xs text-slate-400">{app.salary_offered}</p>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingApp(app);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appToEdit={editingApp}
        onSaved={() => fetchApplications()}
      />
    </div>
  );
};
