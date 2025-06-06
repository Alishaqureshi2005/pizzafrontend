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

// Helper function to calculate distance between two points


// Helper function to determine region bounds from restaurant locations
const calculateRegionBounds = (restaurants) => {
  if (!restaurants || restaurants.length === 0) {
    return null;
  }

  const bounds = {
    north: -90,
    south: 90,
    east: -180,
    west: 180
  };

  restaurants.forEach(restaurant => {
    if (restaurant.location) {
      const { latitude, longitude } = restaurant.location;
      bounds.north = Math.max(bounds.north, latitude);
      bounds.south = Math.min(bounds.south, latitude);
      bounds.east = Math.max(bounds.east, longitude);
      bounds.west = Math.min(bounds.west, longitude);
    }
  });

  // Add some padding to the bounds
  const padding = 0.1; // 0.1 degrees padding
  return {
    north: bounds.north + padding,
    south: bounds.south - padding,
    east: bounds.east + padding,
    west: bounds.west - padding,
    center: {
      latitude: (bounds.north + bounds.south) / 2,
      longitude: (bounds.east + bounds.west) / 2
    }
  };
};

// Helper function to group restaurants by city
const groupRestaurantsByCity = (restaurants) => {
  const cities = {};
  
  restaurants.forEach(restaurant => {
    if (restaurant.location && restaurant.city) {
      if (!cities[restaurant.city]) {
        cities[restaurant.city] = {
          name: restaurant.city,
          restaurants: [],
          bounds: {
            north: -90,
            south: 90,
            east: -180,
            west: 180
          }
        };
      }
      
      cities[restaurant.city].restaurants.push(restaurant);
      
      // Update city bounds
      const { latitude, longitude } = restaurant.location;
      cities[restaurant.city].bounds.north = Math.max(cities[restaurant.city].bounds.north, latitude);
      cities[restaurant.city].bounds.south = Math.min(cities[restaurant.city].bounds.south, latitude);
      cities[restaurant.city].bounds.east = Math.max(cities[restaurant.city].bounds.east, longitude);
      cities[restaurant.city].bounds.west = Math.min(cities[restaurant.city].bounds.west, longitude);
    }
  });

  // Calculate center points for each city
  Object.values(cities).forEach(city => {
    city.center = {
      latitude: (city.bounds.north + city.bounds.south) / 2,
      longitude: (city.bounds.east + city.bounds.west) / 2
    };
  });

  return cities;
};

const restaurantService = {
  // Get all active restaurants (for customers)
  getRestaurants: async () => {
    try {
      console.log('Fetching all restaurants...');
      const response = await api.get('/restaurants', {
        headers: getAuthHeaders(),
        params: {
          includeCoordinates: true
        }
      });
      
      console.log('Restaurants API Response:', response.data);
      
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
        console.log('Formatted restaurants data:', response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in getRestaurants:', error);
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

  // Get restaurants by city
  getRestaurantsByCity: async (cityName) => {
    try {
      console.log('Fetching restaurants for city:', cityName);
      
      const response = await api.get('/restaurants', {
        headers: getAuthHeaders(),
        params: {
          city: cityName,
          includeCoordinates: true
        }
      });

      console.log('City restaurants API response:', response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        const restaurants = response.data.data;
        const cityBounds = calculateRegionBounds(restaurants);
        
        console.log('Calculated city bounds:', cityBounds);

        return {
          ...response.data,
          region: {
            name: cityName,
            bounds: cityBounds,
            center: cityBounds.center
          }
        };
      }

      return response.data;
    } catch (error) {
      console.error('Error in getRestaurantsByCity:', error);
      handleApiError(error);
    }
  },

  // Validate location is within any service area
  validateLocation: async (latitude, longitude) => {
    try {
      console.log('Validating location:', { latitude, longitude });
      
      const response = await api.get('/restaurants/validate-location', {
        headers: getAuthHeaders(),
        params: {
          latitude,
          longitude
        }
      });

      console.log('Location validation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in validateLocation:', error);
      handleApiError(error);
    }
  },
};

export default restaurantService; 