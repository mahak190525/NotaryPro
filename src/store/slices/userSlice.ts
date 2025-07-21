import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userApi } from '../api/supabaseApi';
import { User, ApiError } from '../types';

interface UserState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const updateUserProfile = createAsyncThunk<
  User,
  { userId: string; updates: Partial<User>; provider?: string },
  { rejectValue: ApiError }
>(
  'user/updateProfile',
  async ({ userId, updates, provider }, { rejectWithValue }) => {
    try {
      return await userApi.updateProfile(userId, updates, provider);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to update profile',
        code: error.code,
      });
    }
  }
);

export const loadUserProfile = createAsyncThunk<
  User,
  { userId: string; provider?: string },
  { rejectValue: ApiError }
>(
  'user/loadProfile',
  async ({ userId, provider }, { rejectWithValue }) => {
    try {
      return await userApi.loadProfile(userId, provider);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to load profile',
        code: error.code,
      });
    }
  }
);

export const uploadAvatar = createAsyncThunk<
  string,
  { userId: string; file: File },
  { rejectValue: ApiError }
>(
  'user/uploadAvatar',
  async ({ userId, file }, { rejectWithValue }) => {
    try {
      return await userApi.uploadAvatar(userId, file);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to upload avatar',
        code: error.code,
      });
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      })
      // Load profile
      .addCase(loadUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to load profile';
      })
      // Upload avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.profile) {
          state.profile.avatar = action.payload;
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to upload avatar';
      });
  },
});

export const { clearUserError, setProfile } = userSlice.actions;
export default userSlice.reducer;