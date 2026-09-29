import { apiClient } from './client';
import { JobDescription } from '../types';

export const jobsApi = {
  list: async (search?: string, page = 1): Promise<{ count: number; results: JobDescription[] }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    const res = await apiClient.get(`/jobs/?${params.toString()}`);
    return Array.isArray(res.data) ? { count: res.data.length, results: res.data } : res.data;
  },

  get: async (id: number): Promise<JobDescription> => {
    const res = await apiClient.get<JobDescription>(`/jobs/${id}/`);
    return res.data;
  },

  create: async (data: Partial<JobDescription>): Promise<JobDescription> => {
    const res = await apiClient.post<JobDescription>('/jobs/', data);
    return res.data;
  },

  update: async (id: number, data: Partial<JobDescription>): Promise<JobDescription> => {
    const res = await apiClient.patch<JobDescription>(`/jobs/${id}/`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/jobs/${id}/`);
  },

  extractPreview: async (text: string): Promise<{ skills: string[]; count: number }> => {
    const res = await apiClient.post('/jobs/extract-preview/', { text });
    return res.data;
  }
};
