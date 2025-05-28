import axios from 'axios';
import { API_URL } from '../config';

const deliveryZoneService = {
  // Get all delivery zones
  getAllZones: async () => {
    try {
      const response = await axios.get(`${API_URL}/delivery-zones`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      throw error.response?.data || error.message;
    }
  },

  // Create a new delivery zone
  createZone: async (zoneData, token) => {
    try {
      const response = await axios.post(`${API_URL}/delivery-zones`, zoneData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating delivery zone:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update a delivery zone
  updateZone: async (zoneId, updateData, token) => {
    try {
      const response = await axios.put(`${API_URL}/delivery-zones/${zoneId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error updating delivery zone:', error);
      throw error.response?.data || error.message;
    }
  },

  // Delete a delivery zone
  deleteZone: async (zoneId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/delivery-zones/${zoneId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error deleting delivery zone:', error);
      throw error.response?.data || error.message;
    }
  },

  // Check delivery availability for a location
  checkDeliveryAvailability: async (latitude, longitude) => {
    try {
      const response = await axios.get(`${API_URL}/delivery-zones/check`, {
        params: { latitude, longitude }
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      throw error.response?.data || error.message;
    }
  }
};

export default deliveryZoneService; 