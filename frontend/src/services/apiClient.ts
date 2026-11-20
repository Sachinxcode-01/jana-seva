import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Centralized API Base URL configuration supporting standard /api/v1 gateway
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer Token if present
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('janaseva_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Normalized Error Handling & Session Expiration Gate
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success?: boolean; message?: string }>) => {
    // Session expiration or invalid token handling
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute) {
        console.warn('[JANASEVA API] Session expired or invalid token. Purging session state.');
        localStorage.removeItem('janaseva_token');
        localStorage.removeItem('janaseva_user');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('janaseva:session-expired'));
        }
      }
    }

    const message = 
      error.response?.data?.message || 
      error.message || 
      'An unexpected server error occurred. Please verify your connection.';

    return Promise.reject({
      success: false,
      status: error.response?.status || 500,
      message,
      data: error.response?.data
    });
  }
);
