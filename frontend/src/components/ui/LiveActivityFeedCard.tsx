import React from 'react';
import { useLiveSimulation } from '../../context/LiveSimulationContext';
import { Card } from './Card';
import { Button } from './Button';
import { Radio, Zap, Sparkles, RefreshCw, Database, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LiveActivityFeedCard: React.FC<{ className?: string }> = ({ className }) => {
  const {
    liveEvents,
    simulateLiveEvent,
    seedDemoData,
    isSeeding,
    isLiveActive,
  } = useLiveSimulation();

  return (
    <Card
      title="Live Activity & Real-Time Stream"
      subtitle="Simulated real-time applicant market & status updates"
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={simulateLiveEvent}
            className="flex items-center gap-1 text-2xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1 rounded-lg transition-colors"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            Simulate Event
          </button>
        </div>
      }
      padding="none"
      className={className}
    >
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            {isLiveActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isLiveActive ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              Live Mock Stream Engine
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-2xs px-1.5 py-0.2 rounded font-mono">
                {isLiveActive ? 'ACTIVE' : 'PAUSED'}
              </span>
            </p>
            <p className="text-2xs text-slate-400 mt-0.5">Streaming realistic candidate & market events</p>
          </div>
        </div>

        <button
          onClick={seedDemoData}
          disabled={isSeeding}
          className="flex items-center gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          {isSeeding ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5" />
          )}
          <span>{isSeeding ? 'Seeding...' : 'Seed Sample Data'}</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {liveEvents.slice(0, 5).map((evt) => (
          <div key={evt.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
              style={{ backgroundColor: evt.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-xs text-slate-900 truncate">{evt.title}</span>
                <span className="text-2xs text-slate-400 flex-shrink-0">{evt.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{evt.message}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-2xs font-semibold"
                  style={{
                    backgroundColor: `${evt.color}15`,
                    color: evt.color,
                    border: `1px solid ${evt.color}30`,
                  }}
                >
                  {evt.badge}
                </span>
                {evt.company && (
                  <span className="text-2xs text-slate-500 font-medium">Company: {evt.company}</span>
                )}
                {evt.skill && (
                  <span className="text-2xs text-slate-500 font-medium">Skill: {evt.skill}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
