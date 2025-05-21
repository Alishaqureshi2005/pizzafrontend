import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  preferences: {
    defaultSize: 'medium',
    defaultCrust: 'classic',
    favoriteToppings: [],
    savedAddresses: [],
    defaultPaymentMethod: null,
  },
  recentOrders: [],
  favorites: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addSavedAddress: (state, action) => {
      state.preferences.savedAddresses.push(action.payload);
    },
    removeSavedAddress: (state, action) => {
      state.preferences.savedAddresses = state.preferences.savedAddresses.filter(
        address => address.id !== action.payload
      );
    },
    addToFavorites: (state, action) => {
      if (!state.favorites.find(item => item.id === action.payload.id)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action) => {
      state.favorites = state.favorites.filter(item => item.id !== action.payload);
    },
    addRecentOrder: (state, action) => {
      state.recentOrders.unshift(action.payload);
      // Keep only last 5 orders
      if (state.recentOrders.length > 5) {
        state.recentOrders.pop();
      }
    },
    clearRecentOrders: (state) => {
      state.recentOrders = [];
    },
  },
});

export const {
  setPreferences,
  addSavedAddress,
  removeSavedAddress,
  addToFavorites,
  removeFromFavorites,
  addRecentOrder,
  clearRecentOrders,
} = userSlice.actions;

export default userSlice.reducer; 