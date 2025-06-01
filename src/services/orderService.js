import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error creating order' };
    }
  },

  // Get user's orders
  getUserOrders: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/orders`, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching orders' };
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching order' };
    }
  },

  // Update order status (Admin only)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error updating order status' };
    }
  },

  // Delete order
  deleteOrder: async (orderId) => {
    try {
      const response = await axios.delete(`${API_URL}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error deleting order' };
    }
  },

  // Get all orders (Admin only)
  getAllOrders: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/admin/orders`, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching all orders' };
    }
  },

  // Get orders by user ID (Admin only)
  getOrdersByUserId: async (userId, filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/orders/user/${userId}`, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Error fetching user orders' };
    }
  },

  // Get order history (alias for getUserOrders with filters)
  getOrderHistory: async (filters = {}) => {
    const response = await axios.get(`${API_URL}/orders`, { params: filters });
    return response.data;
  },

  // Get order tracking details
  getOrderTracking: async (orderId) => {
    const response = await axios.get(`${API_URL}/orders/${orderId}/tracking`);
    return response.data;
  },

  // Rate order
  rateOrder: async (orderId, rating) => {
    const response = await axios.post(`${API_URL}/orders/${orderId}/rate`, { rating });
    return response.data;
  },

  // Get delivery zones
  getDeliveryZones: async () => {
    const response = await axios.get(`${API_URL}/delivery-zones`);
    console.log('Delivery zones:', response);
    return response.data;
  },

  // Check delivery availability
  checkDeliveryAvailability: async (address) => {
    const response = await axios.post(`${API_URL}/delivery-zones/check`, { address });
    return response.data;
  },

  // Get available time slots
  getTimeSlots: async (zoneId, date) => {
    const response = await axios.get(`${API_URL}/delivery-zones/${zoneId}/time-slots`, {
      params: { date }
    });
    return response.data;
  },

  // Get nearest delivery zone
  getNearestDeliveryZone: async (coordinates) => {
    try {
      const response = await axios.get(`${API_URL}/delivery-zones/nearest`, {
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
