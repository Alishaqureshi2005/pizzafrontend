import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isPickupOpen, setIsPickupOpen] = useState(false);

  const openPickup = () => setIsPickupOpen(true);
  const closePickup = () => setIsPickupOpen(false);
  const openDelivery = () => setIsDeliveryOpen(true);
  const closeDelivery = () => setIsDeliveryOpen(false);

  return (
    <AppContext.Provider value={{ isDeliveryOpen, openDelivery, closeDelivery,openPickup,closePickup,isPickupOpen }}>
      {children}
    </AppContext.Provider>
  );
};
