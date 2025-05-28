import api from './api';
import { validateDelivery } from '../utils/deliveryValidation';

class DeliveryService {
  async getDeliveryZones() {
    try {
      const response = await api.get('/delivery-zones');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      throw new Error('Failed to fetch delivery zones');
    }
  }

  async getTimeSlots(zoneId) {
    try {
      const response = await api.get(`/delivery-zones/${zoneId}/time-slots`);
      const data = response.data?.data || response.data;
      
      // If the response is an array, return it directly
      if (Array.isArray(data)) {
        return { availableSlots: data };
      }
      
      // If the response has an availableSlots property, return that
      if (data && Array.isArray(data.availableSlots)) {
        return { availableSlots: data.availableSlots };
      }
      
      // If we have slots in a different format, transform them
      if (data && typeof data === 'object') {
        const slots = Object.entries(data).map(([id, slot]) => ({
          id,
          ...slot,
          startTime: slot.startTime || slot.start,
          endTime: slot.endTime || slot.end,
          isAvailable: slot.isAvailable !== false // default to true if not specified
        }));
        return { availableSlots: slots };
      }
      
      // If no valid data format is found, return empty array
      return { availableSlots: [] };
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Return empty slots array instead of throwing
      return { availableSlots: [] };
    }
  }

  async checkAvailability({ latitude, longitude, orderAmount }) {
    try {
      // Validate coordinates
      if (latitude === undefined || longitude === undefined) {
        throw new Error('Latitude and longitude are required');
      }

      // Convert to numbers and validate
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid coordinates format');
      }

      // Log the request for debugging
      console.log('Sending availability check request:', {
        coordinates: { latitude: lat, longitude: lng },
        orderAmount: parseFloat(orderAmount) || 0
      });

      // Send the coordinates directly in the request body, not nested
      const response = await api.post('/delivery-zones/check-availability', {
        latitude: lat,
        longitude: lng,
        orderAmount: parseFloat(orderAmount) || 0
      });

      const data = response.data?.data || response.data;

      // Log the response for debugging
      console.log('Availability check response:', data);

      if (!data) {
        return {
          success: false,
          message: 'Invalid response from server',
          data: null
        };
      }

      // Get time slots if zone is available
      let timeSlots = [];
      if (data.zone?._id) {
        const slotsResponse = await this.getTimeSlots(data.zone._id);
        timeSlots = slotsResponse.availableSlots || [];
      }

      return {
        success: data.success || false,
        message: data.message,
        data: {
          ...data,
          zone: data.zone ? {
            ...data.zone,
            availableTimeSlots: timeSlots
          } : null
        }
      };
    } catch (error) {
      console.error('Error checking delivery availability:', error.response?.data || error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to check delivery availability');
    }
  }

  // Validate delivery information
  async validateDeliveryInfo(address, cartTotal, selectedZone, selectedTimeSlot) {
    return validateDelivery(address, cartTotal, selectedZone, selectedTimeSlot);
  }

  // Get delivery address by ID
  async getDeliveryAddress(addressId) {
    try {
      const response = await api.get(`/delivery-addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery address:', error);
      throw new Error('Failed to fetch delivery address');
    }
  }

  // Get all delivery addresses for the current user
  async getDeliveryAddresses() {
    try {
      const response = await api.get('/delivery-addresses');
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery addresses:', error);
      throw new Error('Failed to fetch delivery addresses');
    }
  }

  // Add a new delivery address
  async addDeliveryAddress(addressData) {
    try {
      const response = await api.post('/delivery-addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Error adding delivery address:', error);
      throw new Error(error.response?.data?.message || 'Failed to add delivery address');
    }
  }

  // Update an existing delivery address
  async updateDeliveryAddress(addressId, addressData) {
    try {
      const response = await api.put(`/delivery-addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery address:', error);
      throw new Error('Failed to update delivery address');
    }
  }

  // Delete a delivery address
  async deleteDeliveryAddress(addressId) {
    try {
      const response = await api.delete(`/delivery-addresses/${addressId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting delivery address:', error);
      throw new Error('Failed to delete delivery address');
    }
  }

  // Set default delivery address
  async setDefaultAddress(addressId) {
    try {
      const response = await api.put(`/delivery-addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      console.error('Error setting default address:', error);
      throw new Error('Failed to set default address');
    }
  }

  // Reset all delivery addresses
  async resetDeliveryAddresses() {
    try {
      const response = await api.delete('/delivery-addresses/reset');
      return response.data;
    } catch (error) {
      console.error('Error resetting delivery addresses:', error);
      throw new Error('Failed to reset delivery addresses');
    }
  }

  // Admin functions
  async createDeliveryZone(zoneData) {
    try {
      const response = await api.post('/delivery-zones', zoneData);
      return response.data;
    } catch (error) {
      console.error('Error creating delivery zone:', error);
      throw new Error('Failed to create delivery zone');
    }
  }

  async updateDeliveryZone(zoneId, zoneData) {
    try {
      const response = await api.put(`/delivery-zones/${zoneId}`, zoneData);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery zone:', error);
      throw new Error('Failed to update delivery zone');
    }
  }

  async deleteDeliveryZone(zoneId) {
    try {
      const response = await api.delete(`/delivery-zones/${zoneId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting delivery zone:', error);
      throw new Error('Failed to delete delivery zone');
    }
  }

  async updateTimeSlot(zoneId, slotData) {
    try {
      const response = await api.put(`/delivery-zones/${zoneId}/time-slots`, slotData);
      return response.data;
    } catch (error) {
      console.error('Error updating time slot:', error);
      throw new Error('Failed to update time slot');
    }
  }
}

export const deliveryService = new DeliveryService(); 