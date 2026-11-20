import { apiClient } from './apiClient';
import { Scheme } from '../types';

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

  async getUsers(): Promise<{ success: boolean; users: any[]; count: number }> {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },

  async getAuditLogs(): Promise<{ success: boolean; logs: any[] }> {
    const res = await apiClient.get('/admin/audit-logs');
    return res.data;
  }
};
