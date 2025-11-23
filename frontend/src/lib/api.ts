import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export default api;

// API Service Functions
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  signup: (data: any) => api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/password-reset/request', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/password-reset', { token, newPassword }),
};

export const invoiceAPI = {
  getAll: (params?: any) => api.get('/invoices', { params }),
  getById: (id: string) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.put(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
  duplicate: (id: string) => api.post(`/invoices/${id}/duplicate`),
};

export const customerAPI = {
  getAll: (params?: any) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
  toggleStatus: (id: string) => api.patch(`/customers/${id}/toggle-status`),
};

export const companyAPI = {
  get: () => api.get('/company'),
  update: (data: any) => api.post('/company', data),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/company/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const exportAPI = {
  pdf: (id: string) => api.get(`/export/${id}/pdf`, { responseType: 'blob' }),
  excel: (id: string) => api.get(`/export/${id}/excel`, { responseType: 'blob' }),
  word: (id: string) => api.get(`/export/${id}/word`, { responseType: 'blob' }),
  email: (id: string, email: string, invoiceNumber: string) =>
    api.post(`/export/${id}/email`, { email, invoiceNumber }),
};

export const analyticsAPI = {
  getDashboard: (year?: number) =>
    api.get('/analytics/dashboard', { params: { year } }),
  getMonthlyRevenue: (year?: number) =>
    api.get('/analytics/revenue/monthly', { params: { year } }),
  getTopCustomers: (limit?: number) =>
    api.get('/analytics/customers/top', { params: { limit } }),
  getStatusBreakdown: () => api.get('/analytics/invoices/status'),
  getRecentActivity: (limit?: number) =>
    api.get('/analytics/activity/recent', { params: { limit } }),
};

export const themeAPI = {
  getAll: () => api.get('/themes'),
  getActive: () => api.get('/themes/active'),
  create: (data: any) => api.post('/themes', data),
  update: (id: string, data: any) => api.put(`/themes/${id}`, data),
  activate: (id: string) => api.post(`/themes/${id}/activate`),
  delete: (id: string) => api.delete(`/themes/${id}`),
};

export const templateAPI = {
  getAll: () => api.get('/templates'),
  getById: (id: string) => api.get(`/templates/${id}`),
  create: (data: any) => api.post('/templates', data),
  update: (id: string, data: any) => api.put(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
};

export const driveAPI = {
  uploadInvoice: (id: string, accessToken: string) =>
    api.post(`/drive/${id}/upload`, { accessToken }),
  listInvoices: (accessToken: string) =>
    api.post('/drive/list', { accessToken }),
  syncAll: (accessToken: string) => api.post('/drive/sync-all', { accessToken }),
};
