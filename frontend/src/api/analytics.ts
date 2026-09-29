import { apiClient } from './client';
import { AnalyticsOverview, AnalyticsApplications, AnalyticsSkills } from '../types';

export const analyticsApi = {
  getOverview: async (): Promise<AnalyticsOverview> => {
    const res = await apiClient.get<AnalyticsOverview>('/analytics/overview/');
    return res.data;
  },

  getApplications: async (): Promise<AnalyticsApplications> => {
    const res = await apiClient.get<AnalyticsApplications>('/analytics/applications/');
    return res.data;
  },

  getSkills: async (): Promise<AnalyticsSkills> => {
    const res = await apiClient.get<AnalyticsSkills>('/analytics/skills/');
    return res.data;
  },

  seedDemoData: async (clearExisting = true): Promise<{ message: string; data: any }> => {
    const res = await apiClient.post('/analytics/seed-demo-data/', { clear_existing: clearExisting });
    return res.data;
  },

  clearDemoData: async (): Promise<{ message: string }> => {
    const res = await apiClient.post('/analytics/clear-demo-data/');
    return res.data;
  },

  getLiveEvents: async (): Promise<{ events: any[]; timestamp: string }> => {
    const res = await apiClient.get('/analytics/live-events/');
    return res.data;
  },
};

