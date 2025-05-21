import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  updateUserDetails: async (userData) => {
    const response = await api.put('/auth/updatedetails', userData);
    return response;
  },

  updatePassword: async (passwordData) => {
    const response = await api.put('/auth/updatepassword', passwordData);
    return response;
  }
}; 