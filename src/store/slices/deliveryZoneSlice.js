import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deliveryService } from '../../services/deliveryService';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  zones: [],
  selectedZone: null,
  availableTimeSlots: [],
  deliveryFee: 0,
  minimumOrderAmount: 0,
  selectedTimeSlot: null,
  deliveryAddress: null,
  loading: false,
  error: null,
  isDeliveryValid: false
};

// Async thunks
export const fetchDeliveryZones = createAsyncThunk(
  'deliveryZones/fetchAll',
  async () => {
    return await deliveryService.getDeliveryZones();
  }
);

// Admin thunks
export const createDeliveryZone = createAsyncThunk(
  'deliveryZones/create',
  async (zoneData, { rejectWithValue }) => {
    try {
      return await deliveryService.createDeliveryZone(zoneData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDeliveryZone = createAsyncThunk(
  'deliveryZones/update',
  async ({ zoneId, zoneData }, { rejectWithValue }) => {
    try {
      return await deliveryService.updateDeliveryZone(zoneId, zoneData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteDeliveryZone = createAsyncThunk(
  'deliveryZones/delete',
  async (zoneId, { rejectWithValue }) => {
    try {
      await deliveryService.deleteDeliveryZone(zoneId);
      return zoneId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkDeliveryAvailability = createAsyncThunk(
  'deliveryZones/checkAvailability',
  async ({ latitude, longitude, orderAmount }) => {
    return await deliveryService.checkAvailability({ latitude, longitude, orderAmount });
  }
);

export const validateDeliveryInfo = createAsyncThunk(
  'deliveryZones/validateDelivery',
  async ({ address, cartTotal, selectedZone, selectedTimeSlot }, { rejectWithValue }) => {
    try {
      const isValid = await deliveryService.validateDeliveryInfo(
        address,
        cartTotal,
        selectedZone,
        selectedTimeSlot
      );
      
      if (!isValid) {
        return rejectWithValue('Delivery validation failed');
      }
      
      return { isValid, address, selectedZone, selectedTimeSlot };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const deliveryZoneSlice = createSlice({
  name: 'deliveryZones',
  initialState,
  reducers: {
    setSelectedZone: (state, action) => {
      state.selectedZone = action.payload;
      if (action.payload) {
        state.deliveryFee = action.payload.baseDeliveryFee || 0;
        state.minimumOrderAmount = action.payload.minimumOrderAmount || 0;
      } else {
        state.deliveryFee = 0;
        state.minimumOrderAmount = 0;
      }
    },
    setSelectedTimeSlot: (state, action) => {
      state.selectedTimeSlot = action.payload;
    },
    setDeliveryAddress: (state, action) => {
      state.deliveryAddress = action.payload;
    },
    resetDeliveryState: (state) => {
      return { ...initialState, zones: state.zones };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch zones
      .addCase(fetchDeliveryZones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryZones.fulfilled, (state, action) => {
        state.loading = false;
        state.zones = action.payload;
      })
      .addCase(fetchDeliveryZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error('Failed to fetch delivery zones');
      })

      // Create zone (Admin)
      .addCase(createDeliveryZone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeliveryZone.fulfilled, (state, action) => {
        state.loading = false;
        state.zones.push(action.payload);
        toast.success('Delivery zone created successfully');
      })
      .addCase(createDeliveryZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to create delivery zone');
      })

      // Update zone (Admin)
      .addCase(updateDeliveryZone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDeliveryZone.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.zones.findIndex(z => z._id === action.payload._id);
        if (index !== -1) {
          state.zones[index] = action.payload;
        }
        toast.success('Delivery zone updated successfully');
      })
      .addCase(updateDeliveryZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to update delivery zone');
      })

      // Delete zone (Admin)
      .addCase(deleteDeliveryZone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDeliveryZone.fulfilled, (state, action) => {
        state.loading = false;
        state.zones = state.zones.filter(z => z._id !== action.payload);
        toast.success('Delivery zone deleted successfully');
      })
      .addCase(deleteDeliveryZone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error('Failed to delete delivery zone');
      })

      // Check availability
      .addCase(checkDeliveryAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkDeliveryAvailability.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          const { zone, availableTimeSlots } = action.payload.data;
          state.selectedZone = zone;
          state.availableTimeSlots = availableTimeSlots || [];
          state.deliveryFee = zone.baseDeliveryFee || 0;
          state.minimumOrderAmount = zone.minimumOrderAmount || 0;
        } else {
          state.selectedZone = null;
          state.availableTimeSlots = [];
          state.deliveryFee = 0;
          state.minimumOrderAmount = 0;
          toast.error(action.payload.message);
        }
      })
      .addCase(checkDeliveryAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.selectedZone = null;
        state.availableTimeSlots = [];
        toast.error('Failed to check delivery availability');
      })

      // Validate delivery
      .addCase(validateDeliveryInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateDeliveryInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.isDeliveryValid = true;
        state.deliveryAddress = action.payload.address;
        state.selectedZone = action.payload.selectedZone;
        state.selectedTimeSlot = action.payload.selectedTimeSlot;
      })
      .addCase(validateDeliveryInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isDeliveryValid = false;
      });
  }
});

export const {
  setSelectedZone,
  setSelectedTimeSlot,
  setDeliveryAddress,
  resetDeliveryState,
  clearError
} = deliveryZoneSlice.actions;

export default deliveryZoneSlice.reducer; 