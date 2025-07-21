import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { settingsApi } from '../api/supabaseApi';
import { Settings, ApiError } from '../types';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

export const fetchUserSettings = createAsyncThunk<
  Settings,
  { userId: string },
  { rejectValue: ApiError }
>(
  'settings/fetchUserSettings',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await settingsApi.fetchSettings(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch user settings',
        code: error.code,
      });
    }
  }
);

export const updateUserSettings = createAsyncThunk<
  Settings,
  { settings: Settings },
  { rejectValue: ApiError }
>(
  'settings/updateUserSettings',
  async ({ settings }, { rejectWithValue }) => {
    try {
      return await settingsApi.updateSettings(settings);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to update user settings',
        code: error.code,
      });
    }
  }
);

export const exportUserData = createAsyncThunk<
  Blob,
  { userId: string; format: 'json' | 'csv' | 'pdf' },
  { rejectValue: ApiError }
>(
  'settings/exportUserData',
  async ({ userId, format }, { rejectWithValue }) => {
    try {
      return await settingsApi.exportUserData(userId, format);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to export user data',
        code: error.code,
      });
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    updateLocalSettings: (state, action) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch settings';
      })
      // Update settings
      .addCase(updateUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update settings';
      })
      // Export data
      .addCase(exportUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportUserData.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to export data';
      });
  },
});

export const { clearSettingsError, updateLocalSettings } = settingsSlice.actions;
export default settingsSlice.reducer;