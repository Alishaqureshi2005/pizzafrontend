import api from './api';
import { handleApiError } from '../utils/errorHandler';
import { deliveryZoneService } from './deliveryZoneService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Restaurant coordinates (you should store this in a config file)
const RESTAURANT_COORDINATES = {
  latitude: 51.5074, // Example coordinates for London
  longitude: -0.1278
};

const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's orders
  getUserOrders: async (filters = {}) => {
    try {
      const response = await api.get('/orders', { params: filters });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update order status (Admin only)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all orders (Admin only)
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders/admin/orders');
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete order
  deleteOrder: async (orderId) => {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get orders by user ID (Admin only)
  getOrdersByUserId: async (userId, filters = {}) => {
    try {
      const response = await api.get(`/orders/user/${userId}`, { params: filters });
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get order history (alias for getUserOrders with filters)
  getOrderHistory: async (filters = {}) => {
    try {
      const response = await api.get('/orders', { params: filters });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get order tracking details
  getOrderTracking: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/tracking`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Rate order
  rateOrder: async (orderId, rating) => {
    try {
      const response = await api.post(`/orders/${orderId}/rate`, { rating });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get delivery zones
  getDeliveryZones: async () => {
    try {
      const response = await api.get('/delivery-zones');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Check delivery availability for an address
  checkDeliveryAvailability: async (address, orderTotal = 0) => {
    try {
      // If coordinates are provided, use them directly
      if (address.coordinates) {
        const deliveryCheck = deliveryZoneService.checkDeliveryAvailability(
          address.coordinates,
          RESTAURANT_COORDINATES
        );

        if (deliveryCheck.available) {
          const deliveryCharge = deliveryZoneService.calculateDeliveryCharge(
            deliveryCheck.distance,
            orderTotal
          );

          return {
            available: true,
            zone: deliveryCheck.zone,
            distance: deliveryCheck.distance,
            deliveryCharge,
            message: `Delivery available in ${deliveryCheck.zone.name}`
          };
        }

        return {
          available: false,
          message: 'Delivery not available for this location'
        };
      }

      // If no coordinates, you might want to geocode the address first
      // This would require a geocoding service like Google Maps API
      throw new Error('Address coordinates are required');
    } catch (error) {
      throw error;
    }
  },

  // Get available time slots
  getTimeSlots: async (zoneId, date) => {
    try {
      const response = await api.get(`/delivery-zones/${zoneId}/time-slots`, { params: { date } });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get nearest delivery zone
  getNearestDeliveryZone: async (coordinates) => {
    try {
      const response = await api.get('/delivery-zones/nearest', { params: { latitude: coordinates.latitude, longitude: coordinates.longitude } });
      return response.data.data;
    } catch (error) {
      console.error('Error getting nearest delivery zone:', error);
      return null;
    }
  }
};

export default orderService;
