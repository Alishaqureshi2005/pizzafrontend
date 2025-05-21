import api from './api';

export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    return api.post('/orders', orderData);
  },

  // Get all orders for current user
  getUserOrders: async () => {
    return api.get('/orders');
  },

  // Get order by ID
  getOrder: async (orderId) => {
    return api.get(`/orders/${orderId}`);
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/cancel`);
    return response.data;
  },

  // Get order history
  getOrderHistory: async (filters = {}) => {
    const response = await api.get('/orders/history', { params: filters });
    return response.data;
  },

  // Get order tracking details
  getOrderTracking: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/tracking`);
    return response.data;
  },

  // Rate order
  rateOrder: async (orderId, rating) => {
    const response = await api.post(`/orders/${orderId}/rate`, { rating });
    return response.data;
  },

  // Get delivery zones
  getDeliveryZones: async () => {
    const response = await api.get('/delivery/zones');
    return response.data;
  },

  // Check delivery availability
  checkDeliveryAvailability: async (address) => {
    const response = await api.post('/delivery/zones/check', { address });
    return response.data;
  },

  // Get available time slots
  getTimeSlots: async (zoneId, date) => {
    const response = await api.get(`/delivery/zones/${zoneId}/time-slots`, {
      params: { date }
    });
    return response.data;
  },

  deleteOrder: async (orderId) => {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 