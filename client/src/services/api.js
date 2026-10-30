import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for session expiration
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login/me checks to prevent redirect loops
      const url = error.config.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/me')) {
        console.warn('[AUTH] Session expired or unauthorized access.');
      }
    }
    return Promise.reject(error);
  }
);

