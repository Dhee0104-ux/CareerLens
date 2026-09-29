import React, { useState } from 'react';
import { useLiveSimulation } from '../../context/LiveSimulationContext';
import { Sparkles, Radio, Zap, Play, Pause, Database, RefreshCw, X, Bell } from 'lucide-react';

export const LiveTickerBar: React.FC = () => {
  const {
    isLiveActive,
    toggleLiveSimulation,
    currentTickerEvent,
    liveEvents,
    simulateLiveEvent,
    seedDemoData,
    clearDemoData,
    isSeeding,
  } = useLiveSimulation();

  const [showEventsDrawer, setShowEventsDrawer] = useState(false);

  return (
    <>
      <div className="bg-slate-900 text-slate-100 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
        {/* Left: Live status and rotating ticker */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              {isLiveActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isLiveActive ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              ></span>
            </span>
            <span className="font-semibold tracking-wider uppercase text-2xs text-slate-300 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" />
              {isLiveActive ? 'Live Real-Time Feed' : 'Live Feed Paused'}
            </span>
          </div>

          <div className="hidden sm:block h-3.5 w-px bg-slate-700 flex-shrink-0" />

          {/* Ticker Content */}
          {currentTickerEvent ? (
            <div className="flex items-center gap-2 truncate text-slate-200">
              <span
                className="px-2 py-0.5 rounded-full text-2xs font-semibold flex-shrink-0"
                style={{
                  backgroundColor: `${currentTickerEvent.color}25`,
                  color: currentTickerEvent.color,
                  border: `1px solid ${currentTickerEvent.color}50`,
                }}
              >
                {currentTickerEvent.badge}
              </span>
              <span className="font-medium text-white truncate">{currentTickerEvent.title}:</span>
              <span className="text-slate-300 truncate">{currentTickerEvent.message}</span>
              <span className="text-2xs text-slate-400 flex-shrink-0 ml-1">({currentTickerEvent.timestamp})</span>
            </div>
          ) : (
            <span className="text-slate-400">Listening for live updates...</span>
          )}
        </div>

        {/* Right: Quick Live Simulation Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowEventsDrawer(true)}
            title="View Live Activity Feed"
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
          >
            <Bell className="w-3 h-3 text-brand-400" />
            <span className="font-medium">Feed</span>
            <span className="ml-0.5 px-1.5 py-0.2 bg-brand-500/30 text-brand-300 text-2xs rounded-full font-bold">
              {liveEvents.length}
            </span>
          </button>

          <button
            onClick={simulateLiveEvent}
            title="Trigger a new real-time simulated update immediately"
            className="flex items-center gap-1 bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/40 px-2.5 py-1 rounded-lg transition-colors font-semibold"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Simulate Event</span>
          </button>

          <button
            onClick={seedDemoData}
            disabled={isSeeding}
            title="Populate test resumes, job descriptions, analyses, and applications"
            className="flex items-center gap-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg transition-colors font-semibold disabled:opacity-50"
          >
            {isSeeding ? (
              <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            ) : (
              <Database className="w-3 h-3 text-emerald-400" />
            )}
            <span>{isSeeding ? 'Seeding...' : 'Seed Mock Data'}</span>
          </button>

          <button
            onClick={toggleLiveSimulation}
            title={isLiveActive ? 'Pause real-time auto-simulation' : 'Resume real-time auto-simulation'}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isLiveActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Live Activity Drawer / Modal */}
      {showEventsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 text-white h-full shadow-2xl flex flex-col border-l border-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Real-Time Event Stream</h3>
                  <p className="text-2xs text-slate-400">Live mock activity log & simulated market updates</p>
                </div>
              </div>
              <button
                onClick={() => setShowEventsDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions Bar */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={simulateLiveEvent}
                className="flex-1 flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Trigger Live Event
              </button>
              <button
                onClick={seedDemoData}
                disabled={isSeeding}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-700 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                Seed Data
              </button>
              <button
                onClick={clearDemoData}
                disabled={isSeeding}
                className="text-2xs text-slate-400 hover:text-rose-400 py-1.5 px-2 rounded hover:bg-rose-950/30 transition-colors"
              >
                Clear Data
              </button>
            </div>

            {/* Stream List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {liveEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2 py-0.5 rounded-full text-2xs font-semibold"
                      style={{
                        backgroundColor: `${evt.color}25`,
                        color: evt.color,
                        border: `1px solid ${evt.color}50`,
                      }}
                    >
                      {evt.badge}
                    </span>
                    <span className="text-2xs text-slate-400">{evt.timestamp}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-white">{evt.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{evt.message}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 text-center text-2xs text-slate-500 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-time engine running • Updates every 25s
            </div>
          </div>
        </div>
      )}
    </>
  );
};
