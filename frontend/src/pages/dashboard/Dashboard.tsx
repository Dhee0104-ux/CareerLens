import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLiveSimulation } from '../../context/LiveSimulationContext';
import { analyticsApi } from '../../api/analytics';
import { AnalyticsOverview, AnalyticsApplications, AnalyticsSkills } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { SkillBadge } from '../../components/ui/SkillBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { LiveActivityFeedCard } from '../../components/ui/LiveActivityFeedCard';
import {
  Briefcase,
  Calendar,
  Trophy,
  FileText,
  Target,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Database,
  RefreshCw,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { refreshKey, seedDemoData, isSeeding, simulateLiveEvent } = useLiveSimulation();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [appData, setAppData] = useState<AnalyticsApplications | null>(null);
  const [skillData, setSkillData] = useState<AnalyticsSkills | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ov, app, sk] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getApplications(),
          analyticsApi.getSkills(),
        ]);
        setOverview(ov);
        setAppData(app);
        setSkillData(sk);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshKey]);

  if (isLoading && !overview) {
    return <LoadingSpinner message="Loading dashboard analytics..." />;
  }

  const hasAnyData =
    (overview?.total_applications || 0) > 0 ||
    (overview?.total_resumes || 0) > 0 ||
    (overview?.total_analyses || 0) > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-900 via-slate-800 to-brand-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Candidate Intelligence
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Feed Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-slate-300 text-sm mt-1.5 leading-relaxed">
            {user?.profile?.target_role
              ? `Targeting: ${user.profile.target_role} • ${user.profile.headline || 'Analyze resume skill match and track applications'}`
              : 'Upload your resume, compare against job descriptions, and level up missing skills.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/analysis">
              <Button size="sm" icon={<Target className="w-4 h-4" />}>
                Run Skill Gap Match
              </Button>
            </Link>
            <Link to="/resumes">
              <Button size="sm" variant="secondary" icon={<FileText className="w-4 h-4" />}>
                Manage Resumes
              </Button>
            </Link>
            <Link to="/applications">
              <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" icon={<Plus className="w-4 h-4" />}>
                Log Application
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={seedDemoData}
              disabled={isSeeding}
              className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30"
              icon={isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            >
              {isSeeding ? 'Seeding Data...' : 'Seed Sample Data'}
            </Button>
          </div>
        </div>

        {/* Decorative ambient background */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Applications</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview?.total_applications ?? 0}</h3>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Interviews</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview?.interview_count ?? 0}</h3>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Offers</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{overview?.offer_count ?? 0}</h3>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Match Score</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
              {overview?.average_match_score !== null && overview?.average_match_score !== undefined
                ? `${overview.average_match_score}%`
                : 'N/A'}
            </h3>
          </div>
        </Card>
      </div>

      {!hasAnyData ? (
        <div className="space-y-6">
          <EmptyState
            icon={<Sparkles className="w-8 h-8" />}
            title="Welcome to your CareerLens Command Center"
            description="You haven't uploaded a resume or logged any job applications yet. You can upload a PDF resume or load sample mock data to explore the real-time experience instantly."
            actionLabel="Seed Realistic Mock Data"
            onAction={seedDemoData}
          />
          <LiveActivityFeedCard />
        </div>
      ) : (
        <>
          {/* Real-time Activity Feed Row */}
          <div className="grid grid-cols-1 gap-6">
            <LiveActivityFeedCard />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications Over Time */}
            <Card
              title="Application Timeline"
              subtitle="Monthly submission frequency"
              padding="md"
            >
              {appData?.timeline && appData.timeline.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={appData.timeline}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <TrendingUp className="w-8 h-8 text-slate-300 mb-2" />
                  <span>Timeline chart will populate as you log applications over time.</span>
                </div>
              )}
            </Card>

            {/* Application Status Breakdown */}
            <Card
              title="Application Funnel Status"
              subtitle="Distribution by pipeline stage"
              padding="md"
            >
              {appData?.status_breakdown && appData.status_breakdown.some((s) => s.count > 0) ? (
                <div className="h-64 w-full flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={appData.status_breakdown.filter((s) => s.count > 0)}
                          dataKey="count"
                          nameKey="status"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {appData.status_breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 space-y-1.5">
                    {appData.status_breakdown
                      .filter((s) => s.count > 0)
                      .map((item) => (
                        <div key={item.key} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2 text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.status}
                          </span>
                          <span className="font-semibold text-slate-900">{item.count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <PieChartIcon className="w-8 h-8 text-slate-300 mb-2" />
                  <span>No applications tracked yet.</span>
                </div>
              )}
            </Card>
          </div>

          {/* Skill Gap & Recent Applications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Missing Skills */}
            <Card
              title="Top Missing Skills"
              subtitle="Skills most requested in your target jobs"
              padding="md"
              className="lg:col-span-1"
            >
              {skillData?.top_missing_skills && skillData.top_missing_skills.length > 0 ? (
                <div className="space-y-2.5">
                  {skillData.top_missing_skills.slice(0, 6).map((item) => (
                    <div
                      key={item.skill}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <SkillBadge skill={item.skill} type="missing" size="sm" />
                      <span className="text-2xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border">
                        {item.frequency} job{item.frequency > 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link to="/analysis" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                      View full roadmap & recommendations <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Run a skill gap analysis to discover most frequent missing skills.
                </p>
              )}
            </Card>

            {/* Recent Applications Table */}
            <Card
              title="Recent Applications"
              subtitle="Latest tracked submissions"
              action={
                <Link to="/applications" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  View all
                </Link>
              }
              padding="none"
              className="lg:col-span-2"
            >
              {overview?.recent_applications && overview.recent_applications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Company & Role</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Applied Date</th>
                        <th className="px-6 py-3">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overview.recent_applications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-semibold text-slate-900">{app.role_title}</p>
                            <p className="text-2xs text-slate-500">{app.company}</p>
                          </td>
                          <td className="px-6 py-3.5">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="px-6 py-3.5 text-slate-600">{app.applied_date}</td>
                          <td className="px-6 py-3.5 text-slate-500">{app.location || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 p-8 text-center">No applications logged yet.</p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
