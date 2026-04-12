import axios from 'axios';

const AWS_PRIMARY_URL = '/';
const RENDER_FALLBACK_URL = 'https://task-manager-api-live.onrender.com';

const api = axios.create({
  // Force AWS Proxy in production, fallback to localhost for local dev
  baseURL: import.meta.env.MODE === 'production' ? AWS_PRIMARY_URL : 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor (Handles Failover & Authentication)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;

    // ACTIVE FAILOVER: If AWS (Primary) fails due to Gateway Timeout or Server Crash, pivot to Render
    if (
      !originalConfig._retry && 
      (err.message === 'Network Error' || err.response?.status >= 500 || err.code === 'ECONNABORTED')
    ) {
      originalConfig._retry = true; // Prevent infinite failover loops
      originalConfig.baseURL = RENDER_FALLBACK_URL;
      
      console.warn(`[Failover Activated] AWS Backend failed (${err.message}). Pivoting to Render Fallback...`);
      // Retry the exact same request seamlessly against Render
      return api(originalConfig);
    }

    // Redirect to login on 401 Unauthorized
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(err);
  }
);

export default api;
