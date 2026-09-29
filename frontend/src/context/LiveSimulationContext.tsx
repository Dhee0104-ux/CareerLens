import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api/analytics';
import { useToast } from './ToastContext';

export interface LiveEvent {
  id: string;
  type: 'status_change' | 'market_trend' | 'match_alert' | 'recommendation' | 'offer_update' | 'interview_invite';
  title: string;
  message: string;
  timestamp: string;
  badge: string;
  color: string;
  company?: string;
  skill?: string;
}

interface LiveSimulationContextType {
  isLiveActive: boolean;
  toggleLiveSimulation: () => void;
  liveEvents: LiveEvent[];
  activeTickerIndex: number;
  currentTickerEvent: LiveEvent | null;
  simulateLiveEvent: () => void;
  seedDemoData: () => Promise<void>;
  clearDemoData: () => Promise<void>;
  isSeeding: boolean;
  refreshKey: number;
  triggerRefresh: () => void;
  lastEventTime: string;
}

const INITIAL_EVENTS: LiveEvent[] = [
  {
    id: 'evt-1',
    type: 'status_change',
    title: 'Stripe Application Update',
    message: 'Round 2 Technical System Design scheduled for Thursday 2:00 PM PST',
    timestamp: 'Just now',
    badge: 'Interview Scheduled',
    color: '#f59e0b',
    company: 'Stripe',
  },
  {
    id: 'evt-2',
    type: 'market_trend',
    title: 'Market Demand Surge ⚡',
    message: 'TypeScript & Next.js demand in Full Stack roles jumped +18.4% this week',
    timestamp: '2m ago',
    badge: 'High Market Demand',
    color: '#3b82f6',
    skill: 'TypeScript',
  },
  {
    id: 'evt-3',
    type: 'match_alert',
    title: 'High Match Alert (94%)',
    message: 'New matching role: Staff React Engineer at Linear matches 94% of your Alex_Rivera resume',
    timestamp: '6m ago',
    badge: '94% Match',
    color: '#10b981',
    company: 'Linear',
  },
  {
    id: 'evt-4',
    type: 'offer_update',
    title: 'Spotify Offer Active',
    message: 'Offer deadline in 10 days ($185,000 base + equity package)',
    timestamp: '14m ago',
    badge: 'Offer Received',
    color: '#10b981',
    company: 'Spotify',
  },
  {
    id: 'evt-5',
    type: 'recommendation',
    title: 'Skill Roadmap Unlock',
    message: 'Mastering Kafka & Kubernetes will increase your Netflix match score from 70% to 95%',
    timestamp: '22m ago',
    badge: 'Growth Opportunity',
    color: '#8b5cf6',
    skill: 'Kubernetes',
  },
];

const RANDOM_EVENT_TEMPLATES = [
  {
    type: 'interview_invite' as const,
    title: 'Google Interview Scheduled',
    message: 'Coding Assessment review complete. Google Recruiter scheduled Technical Screen for next Tuesday!',
    badge: 'Interview Invitation',
    color: '#f59e0b',
    company: 'Google',
  },
  {
    type: 'market_trend' as const,
    title: 'Real-time Skill Trend 📈',
    message: 'PostgreSQL and Redis queries in distributed backend jobs increased +22% in market listings today.',
    badge: 'Skill Demand Spike',
    color: '#3b82f6',
    skill: 'PostgreSQL',
  },
  {
    type: 'match_alert' as const,
    title: 'Instant Job Match (96%)',
    message: 'Figma posted: Senior Frontend Systems Engineer — 96% match with your extracted skills!',
    badge: 'Top Match (96%)',
    color: '#10b981',
    company: 'Figma',
  },
  {
    type: 'status_change' as const,
    title: 'Airbnb Recruiter Screening',
    message: 'Airbnb hiring manager reviewed your resume profile and updated status to Active Screening.',
    badge: 'Screening',
    color: '#8b5cf6',
    company: 'Airbnb',
  },
  {
    type: 'recommendation' as const,
    title: 'Tailored Learning Alert',
    message: 'New official documentation resource added for Docker container optimization & multi-stage builds.',
    badge: 'Learning Tip',
    color: '#06b6d4',
    skill: 'Docker',
  },
];

const LiveSimulationContext = createContext<LiveSimulationContextType | undefined>(undefined);

export const LiveSimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>(INITIAL_EVENTS);
  const [activeTickerIndex, setActiveTickerIndex] = useState<number>(0);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [lastEventTime, setLastEventTime] = useState<string>('Just now');
  const { showToast, success, error, info } = useToast();

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const toggleLiveSimulation = () => {
    setIsLiveActive((prev) => {
      const next = !prev;
      if (next) {
        info('⚡ Real-time live simulation enabled.');
      } else {
        info('⏸️ Real-time live simulation paused.');
      }
      return next;
    });
  };

  const simulateLiveEvent = useCallback(() => {
    const template = RANDOM_EVENT_TEMPLATES[Math.floor(Math.random() * RANDOM_EVENT_TEMPLATES.length)];
    const newEvent: LiveEvent = {
      id: `evt-${Date.now()}`,
      type: template.type,
      title: template.title,
      message: template.message,
      timestamp: 'Just now',
      badge: template.badge,
      color: template.color,
      company: template.company,
      skill: template.skill,
    };

    setLiveEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    setLastEventTime(new Date().toLocaleTimeString());
    setActiveTickerIndex(0);

    // Show visual real-time notification
    info(`⚡ Real-Time Update: ${newEvent.title} — ${newEvent.message}`);
    triggerRefresh();
  }, [info, triggerRefresh]);

  // Periodic ticker rotation and live event emission
  useEffect(() => {
    if (!isLiveActive) return;

    // Rotate ticker every 5 seconds
    const tickerInterval = setInterval(() => {
      setActiveTickerIndex((prev) => (prev + 1) % Math.max(liveEvents.length, 1));
    }, 5000);

    // Emit a new simulated event every 25 seconds
    const eventInterval = setInterval(() => {
      simulateLiveEvent();
    }, 25000);

    return () => {
      clearInterval(tickerInterval);
      clearInterval(eventInterval);
    };
  }, [isLiveActive, liveEvents.length, simulateLiveEvent]);

  // Seed rich demo data from backend
  const seedDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await analyticsApi.seedDemoData(true);
      success(res.message || '🎉 Real-time demo dataset loaded with 2 Resumes, 4 Jobs, 3 Analyses, and 10 Applications!');
      triggerRefresh();
    } catch (err: any) {
      console.error('Failed to seed demo data:', err);
      error('Failed to seed demo data. Please make sure you are signed in.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Clear demo data
  const clearDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await analyticsApi.clearDemoData();
      info(res.message || 'Testing data cleared.');
      triggerRefresh();
    } catch (err: any) {
      console.error('Failed to clear demo data:', err);
      error('Failed to clear demo data.');
    } finally {
      setIsSeeding(false);
    }
  };

  const currentTickerEvent = liveEvents[activeTickerIndex] || liveEvents[0] || null;

  return (
    <LiveSimulationContext.Provider
      value={{
        isLiveActive,
        toggleLiveSimulation,
        liveEvents,
        activeTickerIndex,
        currentTickerEvent,
        simulateLiveEvent,
        seedDemoData,
        clearDemoData,
        isSeeding,
        refreshKey,
        triggerRefresh,
        lastEventTime,
      }}
    >
      {children}
    </LiveSimulationContext.Provider>
  );
};

export const useLiveSimulation = (): LiveSimulationContextType => {
  const context = useContext(LiveSimulationContext);
  if (!context) {
    throw new Error('useLiveSimulation must be used within a LiveSimulationProvider');
  }
  return context;
};
