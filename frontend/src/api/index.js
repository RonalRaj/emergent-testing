import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Health API
export const healthAPI = {
  createEntry: (data) => api.post('/health/log', data),
  getEntries: (limit = 30) => api.get(`/health/entries?limit=${limit}`),
  getEntryByDate: (date) => api.get(`/health/entries/${date}`),
  getStats: () => api.get('/health/stats'),
};

// Goals API
export const goalsAPI = {
  create: (data) => api.post('/goals', data),
  getAll: () => api.get('/goals'),
  delete: (id) => api.delete(`/goals/${id}`),
};

export default api;