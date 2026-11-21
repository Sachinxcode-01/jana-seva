import { apiClient } from './apiClient';
import { Scheme } from '../types';
`cd`
export const adminService = {
  async getMetrics(): Promise<any> {
    const res = await apiClient.get('/admin/metrics');
    return res.data;
  },

  async getAdminDashboard(): Promise<any> {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  async getAdminSchemes(): Promise<{ success: boolean; count: number; schemes: Scheme[] }> {
    const res = await apiClient.get('/admin/schemes');
    return res.data;
  },

  async createScheme(scheme: Partial<Scheme>): Promise<{ success: boolean; scheme?: Scheme; message?: string }> {
    const res = await apiClient.post('/admin/schemes', scheme);
    return res.data;
  },

  async updateScheme(id: string, updates: Partial<Scheme>): Promise<{ success: boolean; scheme?: Scheme; message?: string }> {
    const res = await apiClient.put(`/admin/schemes/${id}`, updates);
    return res.data;
  },

  async deleteScheme(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/admin/schemes/${id}`);
    return res.data;
  },

  async publishScheme(id: string, isPublished?: boolean): Promise<{ success: boolean; message: string; scheme?: Scheme }> {
    const res = await apiClient.patch(`/admin/schemes/${id}/publish`, { isPublished });
    return res.data;
  },

  async archiveScheme(id: string, isArchived?: boolean): Promise<{ success: boolean; message: string; scheme?: Scheme }> {
    const res = await apiClient.patch(`/admin/schemes/${id}/archive`, { isArchived });
    return res.data;
  },

  async bulkImportSchemes(schemes: Partial<Scheme>[]): Promise<{ success: boolean; message: string; created?: number; updated?: number; total?: number }> {
    const res = await apiClient.post('/admin/schemes/bulk-import', { schemes });
    return res.data;
  },

  async exportSchemes(format: 'json' | 'csv' = 'json'): Promise<any> {
    const res = await apiClient.get(`/admin/schemes/export?format=${format}`, {
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return res.data;
  },

  async getUsers(): Promise<{ success: boolean; users: any[]; count: number }> {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },

  async getUserDetails(id: string): Promise<{ success: boolean; user?: any; message?: string }> {
    const res = await apiClient.get(`/admin/users/${id}`);
    return res.data;
  },

  async updateUserStatus(id: string, status: 'active' | 'suspended'): Promise<{ success: boolean; message: string; user?: any }> {
    const res = await apiClient.patch(`/admin/users/${id}/status`, { status });
    return res.data;
  },

  async getAuditLogs(): Promise<{ success: boolean; logs: any[] }> {
    const res = await apiClient.get('/admin/audit-logs');
    return res.data;
  }
};
