import { apiClient } from './apiClient';
import { Scheme } from '../types';

export const bookmarkService = {
  async getSavedSchemes(): Promise<{ success: boolean; count: number; schemes: Scheme[] }> {
    const res = await apiClient.get('/users/me/bookmarks');
    return res.data;
  },

  async saveScheme(schemeId: string): Promise<{ success: boolean; saved: boolean; message?: string }> {
    const res = await apiClient.post(`/users/me/bookmarks/${schemeId}`);
    return res.data;
  },

  async removeBookmark(schemeId: string): Promise<{ success: boolean; saved: boolean; message?: string }> {
    const res = await apiClient.delete(`/users/me/bookmarks/${schemeId}`);
    return res.data;
  },

  async toggleSaveScheme(schemeId: string): Promise<{ success: boolean; saved: boolean }> {
    try {
      const res = await apiClient.post(`/user/saved-schemes/${schemeId}/toggle`);
      return res.data;
    } catch {
      // Fallback local toggle
      const savedIds: string[] = JSON.parse(localStorage.getItem('janaseva_saved_ids') || '[]');
      const exists = savedIds.includes(schemeId);
      const updated = exists ? savedIds.filter(id => id !== schemeId) : [...savedIds, schemeId];
      localStorage.setItem('janaseva_saved_ids', JSON.stringify(updated));
      return { success: true, saved: !exists };
    }
  }
};
