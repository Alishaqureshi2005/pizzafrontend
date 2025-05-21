import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../../services/cartApi';
import { toast } from 'react-toastify';

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

export const syncCart = createAsyncThunk(
  'cart/sync',
  async (cartData, { rejectWithValue }) => {
    try {
      const response = await cartApi.syncCart(cartData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  deliveryFee: 0,
  isDeliveryZoneValid: false,
  selectedTimeSlot: null,
  loading: false,
  error: null
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
        state.items = action.payload.items || [];
        state.total = calculateTotal(state.items, state.deliveryFee);
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
        state.items = action.payload.items || [];
        state.total = calculateTotal(state.items, state.deliveryFee);
        toast.success('Added to cart successfully');
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to add item to cart');
      })
      // Update Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = calculateTotal(state.items, state.deliveryFee);
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
        state.items = action.payload.items || [];
        state.total = calculateTotal(state.items, state.deliveryFee);
        toast.success('Item removed from cart');
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to remove item from cart');
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
      // Sync Cart
      .addCase(syncCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.total = calculateTotal(state.items, state.deliveryFee);
      })
      .addCase(syncCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to sync cart');
      });
  }
});

const calculateTotal = (items, deliveryFee) => {
  const itemsTotal = items.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 1;
    return total + (itemPrice * itemQuantity);
  }, 0);
  return itemsTotal + deliveryFee;
};

export const {
  setDeliveryFee,
  setDeliveryZoneValid,
  setTimeSlot,
  clearError
} = cartSlice.actions;

export default cartSlice.reducer; 