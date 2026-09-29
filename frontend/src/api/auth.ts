import { apiClient } from './client';
import { User, AuthResponse } from '../types';

export const authApi = {
  register: async (data: any): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register/', data);
    return res.data;
  },

  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login/', credentials);
    return res.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me/');
    return res.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await apiClient.patch<User>('/auth/me/', data);
    return res.data;
  }
};
