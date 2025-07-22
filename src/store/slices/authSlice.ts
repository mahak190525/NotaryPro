import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../api/supabaseApi';
import { User, ApiError } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Async thunks for auth operations
export const signInWithEmail = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: ApiError }
>(
  'auth/signInWithEmail',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await authApi.signInWithEmail(email, password);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Sign in failed',
        code: error.code,
      });
    }
  }
);

export const signUpWithEmail = createAsyncThunk<
  User,
  {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName: string;
  },
  { rejectValue: ApiError }
>(
  'auth/signUpWithEmail',
  async ({ email, password, firstName, lastName, businessName }, { rejectWithValue }) => {
    try {
      return await authApi.signUpWithEmail(email, password, firstName, lastName, businessName);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Sign up failed',
        code: error.code,
      });
    }
  }
);

export const signInWithGoogle = createAsyncThunk<
  User,
  { googleUser: any },
  { rejectValue: ApiError }
>(
  'auth/signInWithGoogle',
  async ({ googleUser }, { rejectWithValue }) => {
    try {
      const { supabase } = await import('../../supabase/supabaseClient');
      
      // Check if Google user already exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('google_users')
        .select('*')
        .eq('id', googleUser.sub)
        .single();

      let userData: User;

      if (existingUser && !fetchError) {
        // Google user exists - use the uuid_id as the user ID
        if (!existingUser.uuid_id) {
          throw new Error('Google user missing UUID reference');
        }
        console.log('existingUser',existingUser);
        userData = {
          id: existingUser.uuid_id, // Use the UUID from google_users.uuid_id
          email: existingUser.email,
          firstName: existingUser.first_name || googleUser.given_name || '',
          lastName: existingUser.last_name || googleUser.family_name || '',
          businessName: existingUser.business_name || 'Google User',
          avatar: existingUser.avatar_url || googleUser.picture,
          provider: 'google',
          phone: existingUser.phone || '',
          address: existingUser.address || '',
          city: existingUser.city || '',
          state: existingUser.state || '',
          zipCode: existingUser.zip_code || '',
          licenseNumber: existingUser.license_number || '',
          commissionExpiration: existingUser.commission_expiration || '',
          createdAt: existingUser.created_at || '',
        };

        // Update email if changed
        const { error: updateError } = await supabase
          .from('google_users')
          .update({
            email: googleUser.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', googleUser.sub);

        if (updateError) {
          console.error('Failed to update Google user:', updateError.message);
        }
      } else {
        // New Google user - the trigger will handle creating the users record
        const { data: newGoogleUser, error: insertError } = await supabase
          .from('google_users')
          .insert({
            id: googleUser.sub,
            email: googleUser.email,
            first_name: googleUser.given_name || '',
            last_name: googleUser.family_name || '',
            business_name: 'Google User',
            avatar_url: googleUser.picture,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Check if uuid_id was set by the trigger
        if (!newGoogleUser.uuid_id) {
          throw new Error('Failed to create user UUID reference');
        }

        userData = {
          id: newGoogleUser.uuid_id, // Use the UUID from google_users.uuid_id
          email: googleUser.email,
          firstName: googleUser.given_name || '',
          lastName: googleUser.family_name || '',
          businessName: 'Google User',
          avatar: googleUser.picture,
          provider: 'google',
          createdAt: newGoogleUser.created_at || '',
        };
      }
      
      return userData;
        
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Google sign in failed',
        code: error.code,
      });
    }
  }
);

export const signInWithGoogleOld = createAsyncThunk<
  User,
  { googleUser: any },
  { rejectValue: ApiError }
>(
  'auth/signInWithGoogleOld',
  async ({ googleUser }, { rejectWithValue }) => {
    try {
      const { supabase } = await import('../../supabase/supabaseClient');
      
      // Check if user already exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('google_users')
        .select('*')
        .eq('id', googleUser.sub)
        .single();

      let userData: User;

      if (existingUser && !fetchError) {
        // User exists - preserve existing data
        userData = {
          id: existingUser.id,
          email: existingUser.email,
          firstName: existingUser.first_name || googleUser.given_name || '',
          lastName: existingUser.last_name || googleUser.family_name || '',
          businessName: existingUser.business_name || 'Google User',
          avatar: existingUser.avatar_url || googleUser.picture,
          provider: 'google',
          phone: existingUser.phone || '',
          address: existingUser.address || '',
          city: existingUser.city || '',
          state: existingUser.state || '',
          zipCode: existingUser.zip_code || '',
          licenseNumber: existingUser.license_number || '',
          commissionExpiration: existingUser.commission_expiration || '',
          createdAt: existingUser.created_at || '',
        };

        // Update email if changed
        const { error: updateError } = await supabase
          .from('google_users')
          .update({
            email: googleUser.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', googleUser.sub);

        if (updateError) {
          console.error('Failed to update Google user:', updateError.message);
        }
      } else {
        // New user - create with Google data
        userData = {
          id: googleUser.sub,
          email: googleUser.email,
          firstName: googleUser.given_name || '',
          lastName: googleUser.family_name || '',
          businessName: 'Google User',
          avatar: googleUser.picture,
          provider: 'google',
        };

        const { data: newUserData, error: insertError } = await supabase.from('google_users').insert({
          id: userData.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          business_name: userData.businessName,
          avatar_url: userData.avatar,
          created_at: new Date().toISOString()
        }).select().single();

        if (insertError) {
          throw insertError;
        }
        
        // Add created_at to the userData
        userData.createdAt = newUserData.created_at;
      }
      return userData;
    }
    finally {}
  }
)

export const signOut = createAsyncThunk<void, void, { rejectValue: ApiError }>(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.signOut();
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Sign out failed',
        code: error.code,
      });
    }
  }
);

export const checkAuthStatus = createAsyncThunk<User | null, void, { rejectValue: ApiError }>(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Check stored user data first
      const storedUser = localStorage.getItem('notary_user');
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('notary_user');
        }
      }
      return null;
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Auth check failed',
        code: error.code,
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('notary_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign in with email
      .addCase(signInWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('notary_user', JSON.stringify(action.payload));
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Sign in failed';
      })
      // Sign up with email
      .addCase(signUpWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('notary_user', JSON.stringify(action.payload));
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Sign up failed';
      })
      // Sign in with Google
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('notary_user', JSON.stringify(action.payload));
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Google sign in failed';
      })
      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        localStorage.removeItem('notary_user');
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;