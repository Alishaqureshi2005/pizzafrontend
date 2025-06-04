import axios from 'axios';

const API_URL = '/api/delivery-zones';

// Function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Delivery zones configuration
const DELIVERY_ZONES = [
  {
    id: 1,
    name: 'Zone 1',
    maxDistance: 5, // 5km
    deliveryCharge: 2.50,
    freeDeliveryThreshold: 30 // Free delivery for orders above €30
  },
  {
    id: 2,
    name: 'Zone 2',
    maxDistance: 10, // 10km
    deliveryCharge: 4.50,
    freeDeliveryThreshold: 50 // Free delivery for orders above €50
  },
  {
    id: 3,
    name: 'Zone 3',
    maxDistance: 15, // 15km
    deliveryCharge: 6.50,
    freeDeliveryThreshold: 75 // Free delivery for orders above €75
  }
];

export const deliveryZoneService = {
  // Get delivery zone based on distance
  getDeliveryZone: (distance) => {
    return DELIVERY_ZONES.find(zone => distance <= zone.maxDistance) || null;
  },

  // Calculate delivery charge based on distance and order total
  calculateDeliveryCharge: (distance, orderTotal) => {
    const zone = DELIVERY_ZONES.find(zone => distance <= zone.maxDistance);
    
    if (!zone) {
      return null; // No delivery available for this distance
    }

    // Check if order qualifies for free delivery
    if (orderTotal >= zone.freeDeliveryThreshold) {
      return 0;
    }

    return zone.deliveryCharge;
  },

  // Check if delivery is available for given coordinates
  checkDeliveryAvailability: (customerCoords, restaurantCoords) => {
    const distance = calculateDistance(
      customerCoords.latitude,
      customerCoords.longitude,
      restaurantCoords.latitude,
      restaurantCoords.longitude
    );

    const zone = DELIVERY_ZONES.find(zone => distance <= zone.maxDistance);
    
    return {
      available: !!zone,
      distance: distance,
      zone: zone,
      message: zone 
        ? `Delivery available in ${zone.name}`
        : 'Delivery not available for this location'
    };
  },

  // Get all delivery zones
  getAllZones: () => {
    return DELIVERY_ZONES;
  },

  // Get zone details by ID
  getZoneById: (zoneId) => {
    return DELIVERY_ZONES.find(zone => zone.id === zoneId);
  },

  // Get time slots for a delivery zone
  getTimeSlots: async (zoneId) => {
    try {
      const response = await axios.get(`${API_URL}/${zoneId}/time-slots`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      throw error.response?.data || error.message;
    }
  },

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