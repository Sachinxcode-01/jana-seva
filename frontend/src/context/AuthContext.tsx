import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginAsDemoCitizen: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  register: (data: any) => Promise<{ success: boolean; message?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; devOtp?: string }>;
  resetPassword: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
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

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoCitizen = async () => {
    await login('citizen@janaseva.gov.in', 'Citizen@123');
  };

  const loginAsDemoAdmin = async () => {
    await login('admin@janaseva.gov.in', 'Admin@123');
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
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

  const logout = () => {
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('janaseva_user');
    localStorage.removeItem('janaseva_token');
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
