import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import restaurantService from '../../services/restaurantService';

// Async thunks
export const createRestaurant = createAsyncThunk(
  'restaurants/create',
  async (restaurantData, { rejectWithValue }) => {
    try {
      const response = await restaurantService.createRestaurant(restaurantData);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to create restaurant');
    }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create restaurant');
    }
  }
);

export const fetchRestaurants = createAsyncThunk(
  'restaurants/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getAllRestaurants();
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch restaurants');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch restaurants');
    }
  }
);

export const updateRestaurant = createAsyncThunk(
  'restaurants/update',
  async ({ restaurantId, updateData }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.updateRestaurant(restaurantId, updateData);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to update restaurant');
    }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update restaurant');
    }
  }
);

export const deleteRestaurant = createAsyncThunk(
  'restaurants/delete',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await restaurantService.deleteRestaurant(restaurantId);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to delete restaurant');
    }
      return { ...response, restaurantId };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete restaurant');
    }
  }
);

export const findNearestRestaurant = createAsyncThunk(
  'restaurants/findNearest',
  async ({ latitude, longitude }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.findNearestRestaurant(latitude, longitude);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to find nearest restaurant');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to find nearest restaurant');
    }
  }
);

const initialState = {
  restaurants: [],
  nearestRestaurant: null,
  loading: false,
  error: null,
  currentRestaurant: null
};

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setCurrentRestaurant: (state, action) => {
      state.currentRestaurant = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create restaurant
      .addCase(createRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
        state.restaurants.push(action.payload.data);
        }
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch all restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload.data)) {
        state.restaurants = action.payload.data;
        }
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update restaurant
      .addCase(updateRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
        const updatedRestaurant = action.payload.data;
        const index = state.restaurants.findIndex(r => r._id === updatedRestaurant._id);
        if (index !== -1) {
          state.restaurants[index] = updatedRestaurant;
          }
        }
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete restaurant
      .addCase(deleteRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.restaurants = state.restaurants.filter(r => r._id !== action.payload.restaurantId);
        }
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Find nearest restaurant
      .addCase(findNearestRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(findNearestRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
        state.nearestRestaurant = action.payload.data;
        }
      })
      .addCase(findNearestRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const { setCurrentRestaurant, clearError } = restaurantSlice.actions;
export default restaurantSlice.reducer; 