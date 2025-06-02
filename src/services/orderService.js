import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's orders
  getUserOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update order status (Admin only)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, { status }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete order
  deleteOrder: async (orderId) => {
    try {
      const response = await axios.delete(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all orders (Admin only)
  getAllOrders: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        params: filters
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get orders by user ID (Admin only)
  getOrdersByUserId: async (userId, filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/orders/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        params: filters
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get order history (alias for getUserOrders with filters)
  getOrderHistory: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        params: filters
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get order tracking details
  getOrderTracking: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Rate order
  rateOrder: async (orderId, rating) => {
    try {
      const response = await axios.post(`${API_URL}/orders/${orderId}/rate`, { rating }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get delivery zones
  getDeliveryZones: async () => {
    try {
      const response = await axios.get(`${API_URL}/delivery-zones`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Check delivery availability
  checkDeliveryAvailability: async (address) => {
    try {
      const response = await axios.post(`${API_URL}/delivery-zones/check`, { address }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get available time slots
  getTimeSlots: async (zoneId, date) => {
    try {
      const response = await axios.get(`${API_URL}/delivery-zones/${zoneId}/time-slots`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get nearest delivery zone
  getNearestDeliveryZone: async (coordinates) => {
    try {
      const response = await axios.get(`${API_URL}/delivery-zones/nearest`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        params: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error getting nearest delivery zone:', error);
      return null;
    }
  }
};
