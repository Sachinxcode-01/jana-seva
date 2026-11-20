import { apiClient } from './apiClient';
import { User, UserSession } from '../types';

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export const authService = {
  async login(identifier: string, password: string, rememberMe: boolean = true): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', {
        identifier,
        password,
        rememberMe
      });
      if (res.data.success && res.data.token) {
        localStorage.setItem('janaseva_token', res.data.token);
        if (res.data.user) {
          localStorage.setItem('janaseva_user', JSON.stringify(res.data.user));
        }
      }
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed.' };
    }
  },

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    mobileNumber?: string;
    state?: string;
    district?: string;
    villageTown?: string;
    occupation?: string;
    beneficiaryCategory?: string;
    incomeRange?: string;
    gender?: string;
    preferredLanguage?: string;
    termsAccepted?: boolean;
  }): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/register', data);
      if (res.data.success && res.data.token) {
        localStorage.setItem('janaseva_token', res.data.token);
        if (res.data.user) {
          localStorage.setItem('janaseva_user', JSON.stringify(res.data.user));
        }
      }
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed.' };
    }
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await apiClient.post('/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('janaseva_token');
      localStorage.removeItem('janaseva_user');
    }
    return { success: true, message: 'Logged out successfully.' };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to request password reset.' };
    }
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Password reset failed.' };
    }
  },

  async getProfile(): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const res = await apiClient.get('/users/me');
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to fetch user profile.' };
    }
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.put('/users/me/password', { currentPassword, newPassword });
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update password.' };
    }
  },

  async getSessions(): Promise<{ success: boolean; sessions: UserSession[]; count: number }> {
    try {
      const res = await apiClient.get('/users/me/sessions');
      return res.data;
    } catch {
      return { success: false, sessions: [], count: 0 };
    }
  },

  async revokeSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiClient.delete(`/users/me/sessions/${sessionId}`);
      return res.data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to revoke session.' };
    }
  }
};
