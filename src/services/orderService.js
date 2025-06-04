import api from './api';
import { handleApiError } from '../utils/errorHandler';
import { deliveryZoneService } from './deliveryZoneService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Restaurant coordinates (you should store this in a config file)
const RESTAURANT_COORDINATES = {
  latitude: 51.5074, // Example coordinates for London
  longitude: -0.1278
};

export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      // Calculate delivery charge if it's a delivery order
      if (orderData.orderType === 'delivery' && orderData.deliveryAddress?.coordinates) {
        const deliveryCheck = deliveryZoneService.checkDeliveryAvailability(
          orderData.deliveryAddress.coordinates,
          RESTAURANT_COORDINATES
        );

        if (!deliveryCheck.available) {
          throw new Error(deliveryCheck.message);
        }

        // Calculate delivery charge
        const deliveryCharge = deliveryZoneService.calculateDeliveryCharge(
          deliveryCheck.distance,
          orderData.total.subtotal
        );

        if (deliveryCharge === null) {
          throw new Error('Delivery not available for this location');
        }

        // Add delivery charge to order data
        orderData.deliveryCharge = deliveryCharge;
        orderData.deliveryZone = deliveryCheck.zone;
        orderData.finalPrice = orderData.total.subtotal + deliveryCharge;
      }

      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's orders with filters
  getUserOrders: async (filters = {}) => {
    try {
      const response = await api.get('/orders', { params: filters });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const response = await api.get(`/orders/${orderId}`);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (!response.data.data) {
        throw new Error('Invalid response format from server');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      
      if (error.response) {
        // Handle specific API error responses
        switch (error.response.status) {
          case 404:
            throw new Error('Order not found');
          case 401:
            throw new Error('Please login to view order details');
          case 403:
            throw new Error('You do not have permission to view this order');
          default:
            throw new Error(error.response.data?.message || 'Failed to fetch order details');
        }
      }

      // Handle network or other errors
      if (error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection');
      }

      throw error;
    }
  },

  // Update order status (Admin only)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete order
  deleteOrder: async (orderId) => {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all orders (Admin only)
  getAllOrders: async () => {
    try {
      const response = await api.get('/admin/orders');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  // Get orders by user ID (Admin only)
  getOrdersByUserId: async (userId, filters = {}) => {
    try {
      const response = await api.get(`/orders/user/${userId}`, { params: filters });
      return response.data.data;
    } catch (error) {
      throw error;
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
