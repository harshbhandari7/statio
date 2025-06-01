import axios from 'axios';
import { StatusOverview, Service, Incident, Maintenance, TimelineEvent } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create public API instance without auth interceptor
const publicApiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const auth = {
  login: (email: string, password: string) =>
    api.post('/api/v1/users/login', { email, password }),
  
  register: (email: string, password: string, full_name: string) =>
    api.post('/api/v1/users/register', { email, password, full_name }),
  
  getCurrentUser: () =>
    api.get('/api/v1/users/me'),
};

// User management endpoints (admin only)
export const users = {
  getAll: () => 
    api.get('/api/v1/users'),
    
  updateRole: (userId: number, role: 'admin' | 'manager' | 'viewer') =>
    api.put(`/api/v1/users/${userId}/role`, { role }),
};

// Services endpoints
export const services = {
  getAll: () =>
    api.get('/api/v1/services'),
  
  getById: (id: number) =>
    api.get(`/api/v1/services/${id}`),
  
  create: (data: any) =>
    api.post('/api/v1/services', data),
  
  update: (id: number, data: any) =>
    api.put(`/api/v1/services/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/v1/services/${id}`),
};

// Incidents endpoints
export const incidents = {
  getAll: () =>
    api.get('/api/v1/incidents'),
  
  getById: (id: number) =>
    api.get(`/api/v1/incidents/${id}`),
  
  create: (data: any) =>
    api.post('/api/v1/incidents', data),
  
  update: (id: number, data: any) =>
    api.put(`/api/v1/incidents/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/api/v1/incidents/${id}`),
    
  // Incident updates endpoints
  getUpdates: (incidentId: number) =>
    api.get(`/api/v1/incidents/${incidentId}/updates`),
    
  createUpdate: (incidentId: number, data: any) =>
    api.post(`/api/v1/incidents/${incidentId}/updates`, data),
};

// Public endpoints (no authentication required)
export const publicApi = {
  // Status overview
  getStatus: async (): Promise<StatusOverview> => {
    const response = await publicApiInstance.get('/api/v1/public/status');
    return response.data;
  },
  
  // Services
  getServices: async (): Promise<Service[]> => {
    const response = await publicApiInstance.get('/api/v1/public/services');
    return response.data;
  },
  
  getServiceById: async (id: number): Promise<Service> => {
    const response = await publicApiInstance.get(`/api/v1/public/services/${id}`);
    return response.data;
  },
  
  // Incidents
  getActiveIncidents: async (): Promise<Incident[]> => {
    const response = await publicApiInstance.get('/api/v1/public/incidents/active');
    return response.data;
  },
  
  getIncidentById: async (id: number): Promise<Incident> => {
    const response = await publicApiInstance.get(`/api/v1/public/incidents/${id}`);
    return response.data;
  },
  
  // Maintenances
  getActiveMaintenances: async (): Promise<Maintenance[]> => {
    const response = await publicApiInstance.get('/api/v1/public/maintenances/active');
    return response.data;
  },
  
  getMaintenanceById: async (id: number): Promise<Maintenance> => {
    const response = await publicApiInstance.get(`/api/v1/public/maintenances/${id}`);
    return response.data;
  },
  
  // Timeline
  getTimeline: async (skip: number = 0, limit: number = 20): Promise<TimelineEvent[]> => {
    const response = await publicApiInstance.get('/api/v1/public/timeline', {
      params: { skip, limit }
    });
    return response.data;
  }
};

// Legacy public methods (for backward compatibility)
export const getPublicStatus = publicApi.getStatus;
export const getPublicIncidents = publicApi.getActiveIncidents;
export const getPublicMaintenances = publicApi.getActiveMaintenances;

export default api;
