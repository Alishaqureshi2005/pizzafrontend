import axios from 'axios';

class LocationService {
  async convertAddressToCoordinates(address) {
    try {
      const encodedAddress = encodeURIComponent(address);
      
      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Make the geocoding request with additional parameters
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodedAddress}&` +
        `limit=5&` +
        `addressdetails=1`
      );

      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        throw new Error('No locations found. Please try a more specific address.');
      }

      const result = response.data[0];
      return {
        success: true,
        data: {
          coordinates: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
          },
          address: result.display_name,
          area: result.address?.suburb || 
                result.address?.neighbourhood || 
                result.address?.residential ||
                result.address?.county ||
                result.address?.city ||
                result.address?.town ||
                result.address?.village ||
                'Unknown Area',
          boundingBox: result.boundingbox,
          placeId: result.place_id,
          osmId: result.osm_id,
          addressDetails: result.address
        }
      };
    } catch (error) {
      console.error('Geocoding error details:', error);
      
      if (error.response) {
        // Handle specific API error responses
        if (error.response.status === 429) {
          throw new Error('Too many requests. Please try again in a few moments.');
        }
        if (error.response.status === 400) {
          throw new Error('Invalid address format. Please check the address and try again.');
        }
      }

      // Handle network or other errors
      if (error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }

      return {
        success: false,
        error: error.message || 'Failed to convert address to coordinates. Please try a more specific address.'
      };
    }
  }

  async validateLocation(coordinates) {
    try {
      const { latitude, longitude } = coordinates;
      
      // Basic coordinate validation
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return {
          success: false,
          error: 'Invalid coordinates. Please select a valid location.'
        };
      }

      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get detailed address information for the coordinates
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&` +
        `lat=${latitude}&` +
        `lon=${longitude}&` +
        `addressdetails=1&` +
        `zoom=18`
      );

      if (!response.data || !response.data.display_name) {
        throw new Error('Could not verify location details');
      }

      return {
        success: true,
        data: {
          address: response.data.display_name,
          area: response.data.address?.suburb || 
                response.data.address?.neighbourhood || 
                response.data.address?.residential ||
                response.data.address?.county ||
                response.data.address?.city ||
                response.data.address?.town ||
                response.data.address?.village ||
                'Unknown Area',
          addressDetails: response.data.address
        }
      };
    } catch (error) {
      console.error('Location validation error:', error);
      
      if (error.response) {
        if (error.response.status === 429) {
          throw new Error('Too many requests. Please try again in a few moments.');
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to validate location. Please try again.'
      };
    }
  }
}

export const locationService = new LocationService(); 