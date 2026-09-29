import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/analytics';
import { AnalyticsOverview, AnalyticsApplications, AnalyticsSkills } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SkillBadge } from '../../components/ui/SkillBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useLiveSimulation } from '../../context/LiveSimulationContext';
import {
  BarChart3,
  TrendingUp,
  Target,
  Trophy,
  Briefcase,
  AlertCircle,
  Database,
  RefreshCw,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const { refreshKey, seedDemoData, isSeeding } = useLiveSimulation();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [appData, setAppData] = useState<AnalyticsApplications | null>(null);
  const [skillData, setSkillData] = useState<AnalyticsSkills | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
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
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshKey]);

  if (isLoading && !overview) {
    return <LoadingSpinner message="Calculating application and skill gap metrics..." />;
  }

  const hasData =
    (overview?.total_applications || 0) > 0 ||
    (overview?.total_analyses || 0) > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Trends</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Deep insights into application conversion rates and skill gap frequencies.
            </p>
          </div>
          <Button
            onClick={seedDemoData}
            disabled={isSeeding}
            icon={isSeeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
          >
            {isSeeding ? 'Seeding...' : 'Load Sample Analytics'}
          </Button>
        </div>
        <EmptyState
          icon={<BarChart3 className="w-8 h-8" />}
          title="No Analytics Data Yet"
          description="Log job applications and run resume match analyses to view conversion funnels and skill trends."
          actionLabel="Load Real-Time Sample Data"
          onAction={seedDemoData}
        />
      </div>
    );
  }


  // Calculate interview conversion rate
  const totalApps = overview?.total_applications || 0;
  const interviews = overview?.interview_count || 0;
  const offers = overview?.offer_count || 0;

  const interviewRate = totalApps > 0 ? ((interviews / totalApps) * 100).toFixed(1) : '0';
  const offerRate = interviews > 0 ? ((offers / interviews) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Trends</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Detailed metrics on application pipeline conversion, match score distribution, and skill gaps.
        </p>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md" className="border-brand-200 bg-brand-50/20">
          <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
            Interview Conversion Rate
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{interviewRate}%</span>
          </div>
          <p className="text-2xs text-slate-500 mt-1">
            {interviews} interview(s) from {totalApps} total applications
          </p>
        </Card>

        <Card padding="md" className="border-emerald-200 bg-emerald-50/20">
          <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
            Offer Conversion Rate
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">{offerRate}%</span>
          </div>
          <p className="text-2xs text-slate-500 mt-1">
            {offers} offer(s) from {interviews} interview round(s)
          </p>
        </Card>

        <Card padding="md" className="border-indigo-200 bg-indigo-50/20">
          <p className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
            Average Resume Match Score
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-700">
              {overview?.average_match_score !== null ? `${overview?.average_match_score}%` : 'N/A'}
            </span>
          </div>
          <p className="text-2xs text-slate-500 mt-1">
            Across {overview?.total_analyses || 0} evaluated job analyses
          </p>
        </Card>
      </div>

      {/* Match Score Distribution & Pipeline Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Score Buckets */}
        <Card
          title="Resume Match Score Distribution"
          subtitle="Frequency of analyses bucketed by match percentage"
          padding="md"
        >
          {skillData?.match_score_distribution && skillData.match_score_distribution.some((b) => b.count > 0) ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData.match_score_distribution}>
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Target className="w-8 h-8 text-slate-300 mb-2" />
              <span>Run more skill analyses to see match distribution.</span>
            </div>
          )}
        </Card>

        {/* Pipeline Distribution Bar Chart */}
        <Card
          title="Application Pipeline Breakdown"
          subtitle="Count of applications across each pipeline stage"
          padding="md"
        >
          {appData?.status_breakdown && appData.status_breakdown.some((s) => s.count > 0) ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appData.status_breakdown}>
                  <XAxis dataKey="status" stroke="#94a3b8" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <PieChartIcon className="w-8 h-8 text-slate-300 mb-2" />
              <span>No applications tracked yet.</span>
            </div>
          )}
        </Card>
      </div>

      {/* Top Missing vs Matched Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Skills */}
        <Card
          title="Highest Frequency Missing Skills"
          subtitle="Technologies most frequently missing across your target roles"
          padding="md"
        >
          {skillData?.top_missing_skills && skillData.top_missing_skills.length > 0 ? (
            <div className="space-y-3">
              {skillData.top_missing_skills.map((item, idx) => (
                <div
                  key={item.skill}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-2xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <SkillBadge skill={item.skill} type="missing" size="sm" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border">
                    {item.frequency} job{item.frequency > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center">No missing skills data available.</p>
          )}
        </Card>

        {/* Matched Skills */}
        <Card
          title="Most Frequently Matched Skills"
          subtitle="Your strongest skills aligned with job market requirements"
          padding="md"
        >
          {skillData?.top_matched_skills && skillData.top_matched_skills.length > 0 ? (
            <div className="space-y-3">
              {skillData.top_matched_skills.map((item, idx) => (
                <div
                  key={item.skill}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-2xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <SkillBadge skill={item.skill} type="matched" size="sm" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border">
                    {item.frequency} job{item.frequency > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-8 text-center">No matched skills data available.</p>
          )}
        </Card>
      </div>
    </div>
  );
};
