import React, { createContext, useState } from 'react';

export const AppContext = createContext();

const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;

  const lat1 = coords1.latitude;
  const lon1 = coords1.longitude;
  const lat2 = coords2.latitude;
  const lon2 = coords2.longitude;

  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d; // Distance in km
};

export const DeliveryProvider = ({ children }) => {
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  // New states for order type and delivery fee
  const [orderType, setOrderType] = useState('Pickup'); // 'Pickup' or 'Delivery'
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Store coordinates of the store (hardcoded or fetched from config)
  const storeCoordinates = { latitude: 12.9716, longitude: 77.5946 }; // Example: Bangalore coordinates

  // New method to update delivery fee based on delivery zone or availability response
  const updateDeliveryFee = (zoneOrAvailability) => {
    if (orderType === 'Pickup') {
      setDeliveryFee(0);
      return;
    }
    if (!zoneOrAvailability) {
      setDeliveryFee(0);
      return;
    }

    // If zoneOrAvailability has deliveryCharge property (delivery zone)
    if (zoneOrAvailability.deliveryCharge !== undefined) {
      setDeliveryFee(zoneOrAvailability.deliveryCharge);
      return;
    }

    // Default fallback
    setDeliveryFee(0);
  };

  const openPickup = () => {
    setIsPickupOpen(true);
    setIsDeliveryOpen(false);
    setOrderType('Pickup');
    setDeliveryFee(0);
  };

  const closePickup = () => {
    setIsPickupOpen(false);
  };

  const openDelivery = () => {
    setIsDeliveryOpen(true);
    setIsPickupOpen(false);
    setOrderType('Delivery');
  };

  const closeDelivery = () => {
    setIsDeliveryOpen(false);
  };

  const value = {
    isPickupOpen,
    isDeliveryOpen,
    selectedPickupLocation,
    deliveryAddress,
    orderType,
    deliveryFee,
    setOrderType,
    setDeliveryFee,
    openPickup,
    closePickup,
    openDelivery,
    closeDelivery,
    setSelectedPickupLocation,
    setDeliveryAddress,
    updateDeliveryFee
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
