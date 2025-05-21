import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const DeliveryProvider = ({ children }) => {
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  const openPickup = () => {
    setIsPickupOpen(true);
    setIsDeliveryOpen(false);
  };

  const closePickup = () => {
    setIsPickupOpen(false);
  };

  const openDelivery = () => {
    setIsDeliveryOpen(true);
    setIsPickupOpen(false);
  };

  const closeDelivery = () => {
    setIsDeliveryOpen(false);
  };

  const value = {
    isPickupOpen,
    isDeliveryOpen,
    selectedPickupLocation,
    deliveryAddress,
    openPickup,
    closePickup,
    openDelivery,
    closeDelivery,
    setSelectedPickupLocation,
    setDeliveryAddress
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
