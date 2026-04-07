import api from './axios';

export const login = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data);

export const getTasks = (params) => api.get('/api/tasks', { params });
export const getTaskById = (id) => api.get(`/api/tasks/${id}`);
export const createTask = (data) => api.post('/api/tasks', data);
export const updateTask = (id, data) => api.put(`/api/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);
export const searchTasks = (keyword) => api.get('/api/tasks/search', { params: { keyword } });
export const getDashboard = () => api.get('/api/tasks/dashboard');

export const getAiInsights = (id) => api.get(`/api/tasks/${id}/ai`);
export const triggerAiAnalysis = (id) => api.post(`/api/tasks/${id}/analyze`);

export const uploadFile = (id, file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/api/tasks/${id}/upload`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
