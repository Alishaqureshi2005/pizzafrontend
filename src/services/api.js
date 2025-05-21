import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://pizzahouseb.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject({
        message: 'Unable to connect to the server. Please check if the server is running.',
        errors: [{ field: 'server', message: 'Server connection failed' }]
      });
    }

    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on the login page
      const isLoginPage = window.location.pathname === '/login';
      if (!isLoginPage) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject({
        message: 'Session expired. Please login again.',
        errors: [{ field: 'auth', message: 'Authentication required' }]
      });
    }

    const message = error.response?.data?.message || 'An error occurred';
    const errors = error.response?.data?.errors || [];
    
    return Promise.reject({ message, errors });
  }
);

export default api; 