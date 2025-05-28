import { toast } from 'react-toastify';

export const deliveryValidation = {
  minimumOrder: (amount, zoneMinimum) => {
    const isValid = amount >= zoneMinimum;
    if (!isValid) {
      toast.error(`Minimum order amount is $${zoneMinimum}`);
    }
    return isValid;
  },
  
  timeSlot: (slot) => {
    const isValid = slot && slot.isAvailable;
    if (!isValid) {
      toast.error('Please select a valid delivery time slot');
    }
    return isValid;
  },
  
  location: (coordinates, zone) => {
    if (!coordinates?.latitude || !coordinates?.longitude) {
      toast.error('Please provide a valid delivery address');
      return false;
    }

    // Check if coordinates are within zone bounds
    const isWithinZone = zone ? isLocationWithinZone(coordinates, zone) : false;
    if (!isWithinZone) {
      toast.error('Delivery location is outside the selected zone');
    }
    return isWithinZone;
  }
};

// Helper function to check if a location is within a delivery zone
export const isLocationWithinZone = (coordinates, zone) => {
  if (!coordinates || !zone?.coordinates || !zone?.radius) {
    return false;
  }

  // Calculate distance between points using Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const lat1 = coordinates.latitude * Math.PI / 180;
  const lat2 = zone.coordinates.latitude * Math.PI / 180;
  const deltaLat = (zone.coordinates.latitude - coordinates.latitude) * Math.PI / 180;
  const deltaLon = (zone.coordinates.longitude - coordinates.longitude) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance <= zone.radius;
};

// Comprehensive delivery validation
export const validateDelivery = async (address, cartTotal, selectedZone, selectedTimeSlot) => {
  try {
    // Basic validation
    if (!address || !cartTotal || !selectedZone) {
      toast.error('Please provide all required delivery information');
      return false;
    }

    // Check minimum order
    if (!deliveryValidation.minimumOrder(cartTotal, selectedZone.minimumOrderAmount)) {
      return false;
    }

    // Check location
    if (!deliveryValidation.location(address, selectedZone)) {
      return false;
    }

    // Check time slot
    if (!deliveryValidation.timeSlot(selectedTimeSlot)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating delivery:', error);
    toast.error('Failed to validate delivery information');
    return false;
  }
}; 