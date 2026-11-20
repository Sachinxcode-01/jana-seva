import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrMobile: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  loginAsDemoCitizen: () => Promise<{ success: boolean; message?: string }>;
  loginAsDemoAdmin: () => Promise<{ success: boolean; message?: string }>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  resetPassword: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateUserLocally: (updated: Partial<User>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('janaseva_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('janaseva_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('janaseva_user');
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      console.warn('Failed refreshing citizen profile:', e);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('janaseva_token');
    if (token && user) {
      refreshProfile();
    }

    const handleExpired = () => {
      setUser(null);
      api.setToken(null);
      localStorage.removeItem('janaseva_user');
      localStorage.removeItem('janaseva_token');
    };
    window.addEventListener('janaseva:session-expired', handleExpired);
    return () => window.removeEventListener('janaseva:session-expired', handleExpired);
  }, [refreshProfile]);

  const login = async (emailOrMobile: string, pass: string, rememberMe: boolean = true) => {
    setLoading(true);
    try {
      const res = await api.login(emailOrMobile, pass);
      if (res.success && res.user) {
        setUser(res.user);
        if (rememberMe) {
          localStorage.setItem('janaseva_remember_identifier', emailOrMobile);
        } else {
          localStorage.removeItem('janaseva_remember_identifier');
        }
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed. Please check credentials.' };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoCitizen = async () => {
    return await login('citizen@janaseva.gov.in', 'Citizen@123', true);
  };

  const loginAsDemoAdmin = async () => {
    return await login('admin@janaseva.gov.in', 'Admin@123', true);
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      return await api.forgotPassword(email);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, otp: string, newPass: string) => {
    setLoading(true);
    try {
      return await api.resetPassword(email, otp, newPass);
    } finally {
      setLoading(false);
    }
  };

    const logout = async () => {
      try {
        await api.logout();
      } catch { }
      setUser(null);
      api.setToken(null);
      localStorage.removeItem('janaseva_user');
      localStorage.removeItem('janaseva_token');
    };

    const updateUserLocally = (updated: Partial<User>) => {
      setUser(prev => prev ? { ...prev, ...updated } : null);
    };

    const isAdmin = user?.role === 'admin';

    return (
      <AuthContext.Provider value={{
        user,
        loading,
        login,
        loginAsDemoCitizen,
        loginAsDemoAdmin,
        register,
        forgotPassword,
        resetPassword,
        logout,
        refreshProfile,
        updateUserLocally,
        isAdmin
      }}>
        {children}
      </AuthContext.Provider>
    );
  };

  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
