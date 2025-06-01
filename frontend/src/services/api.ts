import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
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

export default api;
