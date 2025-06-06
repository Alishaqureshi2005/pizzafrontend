import axios from 'axios';

const API_URL = '/api/delivery-zones';


export const deliveryZoneService = {


  // Get delivery fee for an address
  getDeliveryFee: async (address) => {
    try {
      const response = await axios.post(`${API_URL}/get-delivery-fee`, { address });
      return response.data.data;
    } catch (error) {
      console.error('Error getting delivery fee:', error);
      throw error.response?.data || error.message;
    }
  },

  // Admin functions
  createZone: async (zoneData, token) => {
    try {
      const response = await axios.post(API_URL, zoneData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating delivery zone:', error);
      throw error.response?.data || error.message;
    }
  },

  updateZone: async (zoneId, updateData, token) => {
    try {
      const response = await axios.put(`${API_URL}/${zoneId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating delivery zone:', error);
      throw error.response?.data || error.message;
    }
  },

  deleteZone: async (zoneId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/${zoneId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error deleting delivery zone:', error);
      throw error.response?.data || error.message;
    }
  },

  // Update time slot for a delivery zone
  updateTimeSlot: async (zoneId, slotId, updateData, token) => {
    try {
      const response = await axios.put(`${API_URL}/${zoneId}/time-slots/${slotId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating time slot:', error);
      throw error.response?.data || error.message;
    }
  }
}; 