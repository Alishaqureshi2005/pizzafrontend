import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://pizzahouseb.onrender.com/api';

// Create axios instance with auth header
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle different types of errors
    if (error.code === 'ERR_NETWORK') {
      error.message = 'Unable to connect to the server. Please check if the server is running.';
    } else if (error.response?.status === 401) {
      error.message = 'Unauthorized. Please log in again.';
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      error.message = 'Access denied. You do not have permission to perform this action.';
    } else if (error.response?.status === 404) {
      error.message = 'Resource not found. Please check the API endpoint.';
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

// Category APIs
export const categoryApi = {
  getCategories: () => adminApi.get('/categories'),
  getCategory: (id) => adminApi.get(`/categories/${id}`),
  createCategory: (data) => adminApi.post('/categories', data),
  updateCategory: (id, data) => adminApi.put(`/categories/${id}`, data),
  deleteCategory: (id) => adminApi.delete(`/categories/${id}`),
};

// User Management APIs
export const userApi = {
  getUsers: () => adminApi.get('/admin/users'),
  getUser: (id) => adminApi.get(`/admin/users/${id}`),
  updateUser: (id, data) => adminApi.put(`/admin/users/${id}`, data),
  deleteUser: (id) => adminApi.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => adminApi.put(`/admin/users/${id}/role`, { role }),
};

// Product APIs
export const productApi = {
  getProducts: (params) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
    }
    return adminApi.get(`/products?${queryParams.toString()}`);
  },
  getProduct: (id) => adminApi.get(`/products/${id}`),
  createProduct: (formData) => {
    return adminApi.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateProduct: (id, formData) => {
    return adminApi.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteProduct: (id) => adminApi.delete(`/products/${id}`),
};

// Order Management APIs
export const orderApi = {
  // User order APIs (protected)
  createOrder: (orderData) => adminApi.post('/api/orders', orderData),
  getUserOrders: () => adminApi.get('/orders'),
  getOrder: (id) => adminApi.get(`/orders/${id}`),
  deleteOrder: (id) => adminApi.delete(`/orders/${id}`),
  
  // Admin order APIs (protected + admin)
  getAllOrders: () => adminApi.get('/orders/admin/orders'),
  updateOrderStatus: (id, status) => adminApi.put(`/orders/${id}/status`, { status }),
  getOrdersByUserId: (userId, params) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
    }
    return adminApi.get(`/orders/user/${userId}?${queryParams.toString()}`);
  },
};

// Printer Settings
export const printerApi = {
  getPrinterSettings: () => adminApi.get('/printer-settings'),
  updatePrinterSettings: (data) => adminApi.put('/printer-settings', data),
  testPrinter: () => adminApi.post('/printer-settings/test'),
  printOrder: (data) => adminApi.post('/printer-settings/print-order', data),
  printOrderUpdate: (data) => adminApi.post('/printer-settings/print-update', data)
};

export default adminApi; 