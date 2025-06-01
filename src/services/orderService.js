import api from './api';

class OrderService {
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders(params = {}) {
    try {
      const { status, sortBy, sortOrder } = params;
      const queryParams = new URLSearchParams();
      
      if (status) queryParams.append('status', status);
      if (sortBy) queryParams.append('sortBy', sortBy);
      if (sortOrder) queryParams.append('sortOrder', sortOrder);
      
      const url = `/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  async getOrder(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async deleteOrder(orderId) {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  // Admin methods
  async getAllOrders() {
    try {
      const response = await api.get('/orders/admin/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId, params = {}) {
    try {
      const { status, startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      if (status) queryParams.append('status', status);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const url = `/orders/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by user:', error);
      throw error;
    }
  }

  // Get order history (alias for getUserOrders with filters)
  async getOrderHistory(filters = {}) {
    const response = await api.get('/orders', { params: filters });
    return response.data;
  }

  // Get order tracking details
  async getOrderTracking(orderId) {
    const response = await api.get(`/orders/${orderId}/tracking`);
    return response.data;
  }

  // Rate order
  async rateOrder(orderId, rating) {
    const response = await api.post(`/orders/${orderId}/rate`, { rating });
    return response.data;
  }

  // Get delivery zones
  async getDeliveryZones() {
    const response = await api.get('/delivery-zones');
    console.log('Delivery zones:', response);
    return response.data;
  }

  // Check delivery availability
  async checkDeliveryAvailability(address) {
    const response = await api.post('/delivery-zones/check', { address });
    return response.data;
  }

  // Get available time slots
  async getTimeSlots(zoneId, date) {
    const response = await api.get(`/delivery-zones/${zoneId}/time-slots`, {
      params: { date }
    });
    return response.data;
  }

  // Get nearest delivery zone
  async getNearestDeliveryZone(coordinates) {
    try {
      const response = await api.get(`/delivery-zones/nearest`, {
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
}

export const orderService = new OrderService();
