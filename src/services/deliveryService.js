import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class DeliveryService {
  async getDeliveryZones() {
    try {
      const response = await axios.get(`${API_URL}/delivery-zones`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      throw new Error('Failed to fetch delivery zones');
    }
  }

  async getTimeSlots(zoneId) {
    try {
      const response = await axios.get(`${API_URL}/delivery-zones/${zoneId}/time-slots`);
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw new Error('Failed to fetch time slots');
    }
  }

  async checkDeliveryAvailability(coordinates, orderAmount) {
    try {
      const response = await axios.post(`${API_URL}/delivery-zones/check-availability`, {
        coordinates,
        orderAmount
      });
      return response.data;
    } catch (error) {
      console.error('Error checking delivery availability:', error);
      throw new Error('Failed to check delivery availability');
    }
  }

  // Admin functions
  async createDeliveryZone(zoneData) {
    try {
      const response = await axios.post(`${API_URL}/delivery-zones`, zoneData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating delivery zone:', error);
      throw new Error('Failed to create delivery zone');
    }
  }

  async updateDeliveryZone(zoneId, zoneData) {
    try {
      const response = await axios.put(`${API_URL}/delivery-zones/${zoneId}`, zoneData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating delivery zone:', error);
      throw new Error('Failed to update delivery zone');
    }
  }

  async deleteDeliveryZone(zoneId) {
    try {
      const response = await axios.delete(`${API_URL}/delivery-zones/${zoneId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting delivery zone:', error);
      throw new Error('Failed to delete delivery zone');
    }
  }

  async updateTimeSlot(zoneId, slotData) {
    try {
      const response = await axios.put(`${API_URL}/delivery-zones/${zoneId}/time-slots`, slotData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating time slot:', error);
      throw new Error('Failed to update time slot');
    }
  }
}

export const deliveryService = new DeliveryService(); 