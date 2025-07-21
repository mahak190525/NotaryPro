import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mileageApi } from '../api/supabaseApi';
import { MileageTrip, ApiError } from '../types';

interface MileageState {
  trips: MileageTrip[];
  isLoading: boolean;
  error: string | null;
  totalMiles: number;
  businessMiles: number;
  totalDeduction: number;
}

const initialState: MileageState = {
  trips: [],
  isLoading: false,
  error: null,
  totalMiles: 0,
  businessMiles: 0,
  totalDeduction: 0,
};

export const fetchMileageTrips = createAsyncThunk<
  MileageTrip[],
  { userId: string },
  { rejectValue: ApiError }
>(
  'mileage/fetchTrips',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await mileageApi.fetchTrips(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch mileage trips',
        code: error.code,
      });
    }
  }
);

export const addMileageTrip = createAsyncThunk<
  MileageTrip,
  { trip: Omit<MileageTrip, 'id'> },
  { rejectValue: ApiError }
>(
  'mileage/addTrip',
  async ({ trip }, { rejectWithValue }) => {
    try {
      return await mileageApi.addTrip(trip);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to add mileage trip',
        code: error.code,
      });
    }
  }
);

export const updateMileageTrip = createAsyncThunk<
  MileageTrip,
  { trip: MileageTrip },
  { rejectValue: ApiError }
>(
  'mileage/updateTrip',
  async ({ trip }, { rejectWithValue }) => {
    try {
      return await mileageApi.updateTrip(trip);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to update mileage trip',
        code: error.code,
      });
    }
  }
);

export const deleteMileageTrip = createAsyncThunk<
  string,
  { tripId: string },
  { rejectValue: ApiError }
>(
  'mileage/deleteTrip',
  async ({ tripId }, { rejectWithValue }) => {
    try {
      return await mileageApi.deleteTrip(tripId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to delete mileage trip',
        code: error.code,
      });
    }
  }
);

const mileageSlice = createSlice({
  name: 'mileage',
  initialState,
  reducers: {
    clearMileageError: (state) => {
      state.error = null;
    },
    calculateMileageStats: (state) => {
      state.totalMiles = state.trips.reduce((sum, trip) => sum + trip.distance, 0);
      state.businessMiles = state.trips
        .filter(trip => trip.category === 'business')
        .reduce((sum, trip) => sum + trip.distance, 0);
      state.totalDeduction = state.trips
        .filter(trip => trip.category === 'business')
        .reduce((sum, trip) => sum + trip.amount, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch trips
      .addCase(fetchMileageTrips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMileageTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = action.payload;
        mileageSlice.caseReducers.calculateMileageStats(state);
      })
      .addCase(fetchMileageTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch mileage trips';
      })
      // Add trip
      .addCase(addMileageTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMileageTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips.unshift(action.payload);
        mileageSlice.caseReducers.calculateMileageStats(state);
      })
      .addCase(addMileageTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to add mileage trip';
      })
      // Update trip
      .addCase(updateMileageTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMileageTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.trips.findIndex(trip => trip.id === action.payload.id);
        if (index !== -1) {
          state.trips[index] = action.payload;
        }
        mileageSlice.caseReducers.calculateMileageStats(state);
      })
      .addCase(updateMileageTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update mileage trip';
      })
      // Delete trip
      .addCase(deleteMileageTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMileageTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trips = state.trips.filter(trip => trip.id !== action.payload);
        mileageSlice.caseReducers.calculateMileageStats(state);
      })
      .addCase(deleteMileageTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete mileage trip';
      });
  },
});

export const { clearMileageError, calculateMileageStats } = mileageSlice.actions;
export default mileageSlice.reducer;