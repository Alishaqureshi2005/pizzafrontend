import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../../services/cartApi';
import { toast } from 'react-toastify';
import deliveryZoneService from '../../services/deliveryZoneService';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.getCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await cartApi.addToCart(itemData);
      
      // Validate response format
      if (!response || (!response.success && !response.data)) {
        throw new Error('Invalid response format from server');
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, itemData }, { rejectWithValue }) => {
    try {
      const response = await cartApi.updateCartItem(itemId, itemData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await cartApi.removeFromCart(itemId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartApi.clearCart();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkDeliveryAvailability = createAsyncThunk(
  'cart/checkDeliveryAvailability',
  async ({ latitude, longitude }) => {
    return await deliveryZoneService.checkDeliveryAvailability(latitude, longitude);
  }
);

const initialState = {
  items: [],
  total: 0,
  deliveryFee: 0,
  loading: false,
  error: null,
  isDeliveryZoneValid: false,
  selectedTimeSlot: null,
  deliveryZone: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setDeliveryFee: (state, action) => {
      state.deliveryFee = action.payload;
      state.total = calculateTotal(state.items, state.deliveryFee);
    },
    setDeliveryZoneValid: (state, action) => {
      state.isDeliveryZoneValid = action.payload;
    },
    setTimeSlot: (state, action) => {
      state.selectedTimeSlot = action.payload;
    },
    setDeliveryZone: (state, action) => {
      state.deliveryZone = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.items || [];
        state.total = action.payload.data?.totalPrice || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to fetch cart');
      })
      // Add Item
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Handle API response format
        if (action.payload && (action.payload.success || action.payload.data)) {
          const cartData = action.payload.data || action.payload;
          
          // Update cart state with proper validation
          if (Array.isArray(cartData.items)) {
            state.items = cartData.items;
          } else if (cartData.items) {
            state.items = [cartData.items];
          } else {
            state.items = [];
          }
          
          // Update total with proper validation
          state.total = Number(cartData.total || cartData.totalPrice || 0);
          if (isNaN(state.total)) {
            state.total = calculateTotal(state.items, state.deliveryFee);
          }
          
          toast.success('Added to cart successfully');
        } else {
          state.error = 'Invalid response format from server';
          toast.error(state.error);
        }
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add item to cart';
        toast.error(state.error);
      })
      // Update Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.items || [];
        state.total = action.payload.data?.totalPrice || 0;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to update item quantity');
      })
      // Remove Item
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handle both direct cart object and wrapped response formats
        const cartData = action.payload?.data || action.payload;
        
        if (cartData) {
          // Update items array
          state.items = cartData.data?.items || [];
          
          // Update total price
          state.total = cartData.data?.totalPrice || cartData.data?.total || calculateTotal(cartData.data?.items || [], state.deliveryFee);
          
          toast.success('Item removed from cart');
        } else {
          state.error = 'Failed to update cart state';
          toast.error(state.error);
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to remove item from cart';
        toast.error(state.error);
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.total = 0;
        state.deliveryFee = 0;
        state.isDeliveryZoneValid = false;
        state.selectedTimeSlot = null;
        toast.success('Cart cleared successfully');
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to clear cart');
      })
      // Check delivery availability
      .addCase(checkDeliveryAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkDeliveryAvailability.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.deliveryZone = action.payload.data.zone;
          state.deliveryFee = action.payload.data.deliveryFee;
          state.isDeliveryZoneValid = true;
        } else {
          state.deliveryZone = null;
          state.deliveryFee = 0;
          state.isDeliveryZoneValid = false;
        }
      })
      .addCase(checkDeliveryAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.deliveryZone = null;
        state.deliveryFee = 0;
        state.isDeliveryZoneValid = false;
      });
  }
});

const calculateTotal = (items, deliveryFee) => {
  const itemsTotal = items.reduce((total, item) => {
    const itemPrice = parseFloat(item.price) || 0;
    const itemQuantity = parseInt(item.quantity) || 1;
    return total + (itemPrice * itemQuantity);
  }, 0);
  return itemsTotal + (parseFloat(deliveryFee) || 0);
};

export const {
  setDeliveryFee,
  setDeliveryZoneValid,
  setTimeSlot,
  setDeliveryZone,
  clearError
} = cartSlice.actions;

export default cartSlice.reducer; 