import api from './api';

const formatTime = (time) => {
  try {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return time;
  }
};

const generateTimeSlots = (openTime, closeTime, interval = 30) => {
  const slots = [];
  const start = new Date();
  const end = new Date();
  
  // Parse open and close times
  const [openHours, openMinutes] = openTime.split(':');
  const [closeHours, closeMinutes] = closeTime.split(':');
  
  start.setHours(parseInt(openHours), parseInt(openMinutes), 0);
  end.setHours(parseInt(closeHours), parseInt(closeMinutes), 0);
  
  // Handle cases where closing time is on the next day
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  // Generate slots
  let current = new Date(start);
  while (current < end) {
    const slotStart = current.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    current = new Date(current.getTime() + interval * 60000);
    const slotEnd = current.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    slots.push({
      start: slotStart,
      end: slotEnd
    });
  }
  
  return slots;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const message = error.response.data?.message || 'An error occurred';
    throw new Error(message);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'An error occurred');
  }
};

// Add region constants
const REGIONS = {
  MITHI: {
    name: 'Mithi',
    bounds: {
      north: 25.2,
      south: 24.2,
      east: 70.5,
      west: 68.9
    },
    center: {
      latitude: 24.7337,
      longitude: 69.7967
    }
  }
  // Add more regions as needed
};

// Helper function to check if coordinates are within a region
const isWithinRegion = (latitude, longitude, region) => {
  return (
    latitude >= region.bounds.south &&
    latitude <= region.bounds.north &&
    longitude >= region.bounds.west &&
    longitude <= region.bounds.east
  );
};

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const restaurantService = {
  // Get all active restaurants (for customers)
  getRestaurants: async () => {
    try {
      const response = await api.get('/restaurants', {
        headers: getAuthHeaders()
      });
      
      // Format operating hours for each restaurant
      if (response.data.success && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map(restaurant => ({
          ...restaurant,
          formattedHours: restaurant.operatingHours ? 
            Object.entries(restaurant.operatingHours).reduce((acc, [day, hours]) => {
              if (hours && hours.open && hours.close) {
                acc[day] = {
                  open: formatTime(hours.open),
                  close: formatTime(hours.close)
                };
              }
              return acc;
            }, {}) : {}
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      handleApiError(error);
    }
  },

  // Get all restaurants (for admin)
  getAllRestaurants: async () => {
    try {
      const response = await api.get('/restaurants/', {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all restaurants:', error);
      handleApiError(error);
    }
  },

  // Create a new restaurant (admin only)
  createRestaurant: async (restaurantData) => {
    try {
      const response = await api.post('/restaurants', restaurantData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      handleApiError(error);
    }
  },

  // Update a restaurant (admin only)
  updateRestaurant: async (restaurantId, updateData) => {
    try {
      const response = await api.put(`/restaurants/${restaurantId}`, updateData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      handleApiError(error);
    }
  },

  // Delete a restaurant (admin only)
  deleteRestaurant: async (restaurantId) => {
    try {
      const response = await api.delete(`/restaurants/${restaurantId}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      handleApiError(error);
    }
  },

  // Find nearest restaurant with region check
  findNearestRestaurant: async (latitude, longitude) => {
    try {
      // First check if the location is within the Mithi region
      if (!isWithinRegion(latitude, longitude, REGIONS.MITHI)) {
        throw new Error('Location is outside our service area. Please enter an address in the Mithi region.');
      }

      const response = await api.get(`/restaurants/nearest?latitude=${latitude}&longitude=${longitude}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success && response.data.data) {
        const restaurant = response.data.data;
        
        // Calculate actual distance
        const distance = calculateDistance(
          latitude,
          longitude,
          restaurant.location.latitude,
          restaurant.location.longitude
        );

        // Add distance information to the response
        return {
          ...response.data,
          data: {
            ...restaurant,
            distance: distance.toFixed(2),
            isWithinServiceArea: distance <= restaurant.serviceRadius
          }
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error finding nearest restaurant:', error);
      handleApiError(error);
    }
  },

  // Get restaurants by region with coordinates
  getRestaurantsByRegion: async (regionName = 'MITHI') => {
    try {
      const region = REGIONS[regionName];
      if (!region) {
        throw new Error('Invalid region specified');
      }

      const response = await api.get('/restaurants', {
        headers: getAuthHeaders(),
        params: {
          region: regionName,
          latitude: region.center.latitude,
          longitude: region.center.longitude,
          includeCoordinates: true
        }
      });

      // Format operating hours and add region information
      if (response.data.success && Array.isArray(response.data.data)) {
        response.data.data = response.data.data.map(restaurant => ({
          ...restaurant,
          formattedHours: restaurant.operatingHours ? 
            Object.entries(restaurant.operatingHours).reduce((acc, [day, hours]) => {
              if (hours && hours.open && hours.close) {
                acc[day] = {
                  open: formatTime(hours.open),
                  close: formatTime(hours.close)
                };
              }
              return acc;
            }, {}) : {},
          region: regionName,
          isWithinServiceArea: restaurant.location ? 
            isWithinRegion(
              restaurant.location.latitude,
              restaurant.location.longitude,
              region
            ) : false,
          // Add distance from region center
          distanceFromCenter: restaurant.location ? 
            calculateDistance(
              region.center.latitude,
              region.center.longitude,
              restaurant.location.latitude,
              restaurant.location.longitude
            ).toFixed(2) : null
        }));

        // Sort restaurants by distance from region center
        response.data.data.sort((a, b) => {
          if (!a.distanceFromCenter) return 1;
          if (!b.distanceFromCenter) return -1;
          return parseFloat(a.distanceFromCenter) - parseFloat(b.distanceFromCenter);
        });
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants by region:', error);
      handleApiError(error);
    }
  },

  // Get restaurant details by coordinates
  getRestaurantByCoordinates: async (latitude, longitude) => {
    try {
      // First validate if coordinates are within any region
      const region = Object.entries(REGIONS).find(([_, region]) => 
        isWithinRegion(latitude, longitude, region)
      );

      if (!region) {
        throw new Error('Location is outside our service areas');
      }

      const response = await api.get('/restaurants/nearby', {
        headers: getAuthHeaders(),
        params: {
          latitude,
          longitude,
          region: region[0]
        }
      });

      if (response.data.success && response.data.data) {
        const restaurant = response.data.data;
        const distance = calculateDistance(
          latitude,
          longitude,
          restaurant.location.latitude,
          restaurant.location.longitude
        );

        return {
          ...response.data,
          data: {
            ...restaurant,
            distance: distance.toFixed(2),
            region: region[0],
            isWithinServiceArea: distance <= restaurant.serviceRadius
          }
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error finding restaurant by coordinates:', error);
      handleApiError(error);
    }
  },

  // Get all restaurants in a region with their coordinates
  getAllRestaurantsInRegion: async (regionName = 'MITHI') => {
    try {
      const region = REGIONS[regionName];
      if (!region) {
        throw new Error('Invalid region specified');
      }

      const response = await api.get('/restaurants/all', {
        headers: getAuthHeaders(),
        params: {
          region: regionName,
          includeCoordinates: true
        }
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        return {
          ...response.data,
          data: response.data.data.map(restaurant => ({
            ...restaurant,
            region: regionName,
            distanceFromCenter: restaurant.location ? 
              calculateDistance(
                region.center.latitude,
                region.center.longitude,
                restaurant.location.latitude,
                restaurant.location.longitude
              ).toFixed(2) : null
          }))
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching all restaurants in region:', error);
      handleApiError(error);
    }
  },

  // Search restaurants by name in a region
  searchRestaurantsInRegion: async (searchTerm, regionName = 'MITHI') => {
    try {
      const region = REGIONS[regionName];
      if (!region) {
        throw new Error('Invalid region specified');
      }

      const response = await api.get('/restaurants/search', {
        headers: getAuthHeaders(),
        params: {
          search: searchTerm,
          region: regionName,
          includeCoordinates: true
        }
      });

      if (response.data.success && Array.isArray(response.data.data)) {
        return {
          ...response.data,
          data: response.data.data.map(restaurant => ({
            ...restaurant,
            region: regionName,
            distanceFromCenter: restaurant.location ? 
              calculateDistance(
                region.center.latitude,
                region.center.longitude,
                restaurant.location.latitude,
                restaurant.location.longitude
              ).toFixed(2) : null
          }))
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error searching restaurants in region:', error);
      handleApiError(error);
    }
  },

  // Validate restaurant location
  validateRestaurantLocation: (latitude, longitude) => {
    return isWithinRegion(latitude, longitude, REGIONS.MITHI);
  },

  // Get region information
  getRegionInfo: (regionName = 'MITHI') => {
    return REGIONS[regionName] || null;
  },

  // Get time slots for a specific restaurant
  getTimeSlots: async (restaurant) => {
    try {
      // Get current day
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[new Date().getDay()];
      
      // Get operating hours for today
      const hours = restaurant.operatingHours?.[today];
      
      if (!hours || !hours.open || !hours.close) {
        return {
          success: false,
          message: 'Restaurant is closed today'
        };
      }
      
      // Generate time slots
      const slots = generateTimeSlots(hours.open, hours.close);
      
      return {
        success: true,
        data: slots
      };
    } catch (error) {
      console.error('Error generating time slots:', error);
      handleApiError(error);
    }
  }
};

export default restaurantService; 