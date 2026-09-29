import { apiClient } from './client';
import { Resume } from '../types';

export const resumesApi = {
  list: async (page = 1): Promise<{ count: number; results: Resume[] }> => {
    const res = await apiClient.get(`/resumes/?page=${page}`);
    // If backend pagination is active, results is an array in res.data.results
    return Array.isArray(res.data) ? { count: res.data.length, results: res.data } : res.data;
  },

  get: async (id: number): Promise<Resume> => {
    const res = await apiClient.get<Resume>(`/resumes/${id}/`);
    return res.data;
  },

  upload: async (file: File, onUploadProgress?: (progressEvent: any) => void): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<Resume>('/resumes/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return res.data;
  },

  reprocess: async (id: number): Promise<Resume> => {
    const res = await apiClient.post<Resume>(`/resumes/${id}/reprocess/`);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/resumes/${id}/`);
  },
};
