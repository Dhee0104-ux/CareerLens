import { apiClient } from './client';
import { JobApplication, ApplicationStatus } from '../types';

export const applicationsApi = {
  list: async (status?: string, search?: string, ordering?: string, page = 1): Promise<{ count: number; results: JobApplication[] }> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (ordering) params.append('ordering', ordering);
    params.append('page', page.toString());

    const res = await apiClient.get(`/applications/?${params.toString()}`);
    return Array.isArray(res.data) ? { count: res.data.length, results: res.data } : res.data;
  },

  get: async (id: number): Promise<JobApplication> => {
    const res = await apiClient.get<JobApplication>(`/applications/${id}/`);
    return res.data;
  },

  create: async (data: Partial<JobApplication>): Promise<JobApplication> => {
    const res = await apiClient.post<JobApplication>('/applications/', data);
    return res.data;
  },

  update: async (id: number, data: Partial<JobApplication>): Promise<JobApplication> => {
    const res = await apiClient.patch<JobApplication>(`/applications/${id}/`, data);
    return res.data;
  },

  updateStatus: async (id: number, status: ApplicationStatus): Promise<JobApplication> => {
    const res = await apiClient.patch<JobApplication>(`/applications/${id}/status/`, { status });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/applications/${id}/`);
  },
};
