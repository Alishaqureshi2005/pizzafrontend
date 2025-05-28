import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import userReducer from './slices/userSlice';
import restaurantReducer from './slices/restaurantSlice';
import deliveryZoneReducer from './slices/deliveryZoneSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    orders: orderReducer,
    user: userReducer,
    restaurants: restaurantReducer,
    deliveryZones: deliveryZoneReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
}); 