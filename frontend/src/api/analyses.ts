import { apiClient } from './client';
import { SkillAnalysis } from '../types';

export const analysesApi = {
  list: async (page = 1): Promise<{ count: number; results: SkillAnalysis[] }> => {
    const res = await apiClient.get(`/analyses/?page=${page}`);
    return Array.isArray(res.data) ? { count: res.data.length, results: res.data } : res.data;
  },

  get: async (id: number): Promise<SkillAnalysis> => {
    const res = await apiClient.get<SkillAnalysis>(`/analyses/${id}/`);
    return res.data;
  },

  create: async (data: { resume_id: number; job_id: number }): Promise<SkillAnalysis> => {
    const res = await apiClient.post<SkillAnalysis>('/analyses/', data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/analyses/${id}/`);
  },
};
