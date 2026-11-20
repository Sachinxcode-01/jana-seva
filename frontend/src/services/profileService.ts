import { apiClient } from './apiClient';
import { User } from '../types';

export const profileService = {
  async getProfile(): Promise<{ success: boolean; user?: User; message?: string }> {
    const res = await apiClient.get('/users/me');
    return res.data;
  },

  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; user?: User; message?: string }> {
    const res = await apiClient.put('/users/me', updates);
    return res.data;
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete('/users/me');
    return res.data;
  },

  async exportData(): Promise<{ success: boolean; data: any }> {
    const res = await apiClient.get('/users/me/export');
    return res.data;
  }
};
