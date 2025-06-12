import adminApi from './adminApi';

const API_URL = '/api/delivery-zones';

export const deliveryZoneService = {
  getAllDeliveryZones: async () => {
    try {
      const response = await adminApi.get('/delivery-zones');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createDeliveryZone: async (zoneData) => {
    try {
      const response = await adminApi.post('/delivery-zones', zoneData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateDeliveryZone: async (id, zoneData) => {
    try {
      const response = await adminApi.put(`/delivery-zones/${id}`, zoneData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteDeliveryZone: async (id) => {
    try {
      const response = await adminApi.delete(`/delivery-zones/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get delivery fee for an address
  getDeliveryFee: async (address) => {
    try {
      const response = await adminApi.post('/delivery-zones/get-delivery-fee', { address });
      return response.data.data;
    } catch (error) {
      console.error('Error getting delivery fee:', error);
      throw error.response?.data || error.message;
    }
  },

  // Admin functions
  createZone: async (zoneData, token) => {
    try {
      const response = await adminApi.post('/delivery-zones', zoneData, {
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
      const response = await adminApi.put(`/delivery-zones/${zoneId}`, updateData, {
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
      const response = await adminApi.delete(`/delivery-zones/${zoneId}`, {
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
      const response = await adminApi.put(`/delivery-zones/${zoneId}/time-slots/${slotId}`, updateData, {
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