import axios from 'axios';
import { API_URL } from '../config';

const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/api/orders`, orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create order' };
    }
  },

  // Get user's orders
  getUserOrders: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders`, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch orders' };
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch order' };
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update order status' };
    }
  },

  // Delete order
  deleteOrder: async (orderId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete order' };
    }
  },

  // Admin methods
  getAllOrders: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/admin/orders`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch all orders' };
    }
  },

  getOrdersByUserId: async (userId, params = {}) => {
    try {
      const { status, startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      if (status) queryParams.append('status', status);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const response = await axios.get(`${API_URL}/api/orders/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch orders by user' };
    }
  },

  // Get order history (alias for getUserOrders with filters)
  getOrderHistory: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders`, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch order history' };
    }
  },

  // Get order tracking details
  getOrderTracking: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch order tracking details' };
    }
  },

  // Rate order
  rateOrder: async (orderId, rating) => {
    try {
      const response = await axios.post(`${API_URL}/api/orders/${orderId}/rate`, { rating });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to rate order' };
    }
  },

  // Get delivery zones
  getDeliveryZones: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery-zones`);
      console.log('Delivery zones:', response);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch delivery zones' };
    }
  },

  // Check delivery availability
  checkDeliveryAvailability: async (address) => {
    try {
      const response = await axios.post(`${API_URL}/api/delivery-zones/check`, { address });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to check delivery availability' };
    }
  },

  // Get available time slots
  getTimeSlots: async (zoneId, date) => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery-zones/${zoneId}/time-slots`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch time slots' };
    }
  },

  // Get nearest delivery zone
  getNearestDeliveryZone: async (coordinates) => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery-zones/nearest`, {
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

export { orderService };
