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

  // Find nearest restaurant
  findNearestRestaurant: async (latitude, longitude) => {
    try {
      const response = await api.get(`/restaurants/nearest?latitude=${latitude}&longitude=${longitude}`, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error finding nearest restaurant:', error);
      handleApiError(error);
    }
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