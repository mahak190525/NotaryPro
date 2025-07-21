import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { importOrdersApi } from '../api/supabaseApi';
import { ApiError } from '../types';

export interface ImportedOrder {
  id: string;
  orderNumber: string;
  signerName: string;
  signerPhone: string;
  signerEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  documentType: string;
  fee: number;
  mileage: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  source: string;
  importedAt: string;
  notes: string;
  specialInstructions: string;
  userId: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'signing' | 'escrow' | 'title' | 'lender';
  isConnected: boolean;
  lastSync?: string;
  ordersImported: number;
  status: 'active' | 'error' | 'pending' | 'setup_required';
  features: string[];
  setupSteps: string[];
  userId: string;
}

interface ImportOrdersState {
  orders: ImportedOrder[];
  integrations: Integration[];
  isLoading: boolean;
  error: string | null;
  isImporting: boolean;
}

const initialState: ImportOrdersState = {
  orders: [],
  integrations: [],
  isLoading: false,
  error: null,
  isImporting: false,
};

export const fetchImportedOrders = createAsyncThunk<
  ImportedOrder[],
  { userId: string },
  { rejectValue: ApiError }
>(
  'importOrders/fetchOrders',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await importOrdersApi.fetchOrders(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch imported orders',
        code: error.code,
      });
    }
  }
);

export const fetchIntegrations = createAsyncThunk<
  Integration[],
  { userId: string },
  { rejectValue: ApiError }
>(
  'importOrders/fetchIntegrations',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await importOrdersApi.fetchIntegrations(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch integrations',
        code: error.code,
      });
    }
  }
);

export const addImportedOrder = createAsyncThunk<
  ImportedOrder,
  { order: Omit<ImportedOrder, 'id'> },
  { rejectValue: ApiError }
>(
  'importOrders/addOrder',
  async ({ order }, { rejectWithValue }) => {
    try {
      return await importOrdersApi.addOrder(order);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to add imported order',
        code: error.code,
      });
    }
  }
);

export const updateOrderStatus = createAsyncThunk<
  ImportedOrder,
  { orderId: string; status: ImportedOrder['status'] },
  { rejectValue: ApiError }
>(
  'importOrders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await importOrdersApi.updateOrderStatus(orderId, status);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to update order status',
        code: error.code,
      });
    }
  }
);

export const toggleIntegration = createAsyncThunk<
  Integration,
  { integrationId: string; isConnected: boolean },
  { rejectValue: ApiError }
>(
  'importOrders/toggleIntegration',
  async ({ integrationId, isConnected }, { rejectWithValue }) => {
    try {
      return await importOrdersApi.toggleIntegration(integrationId, isConnected);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to toggle integration',
        code: error.code,
      });
    }
  }
);

const importOrdersSlice = createSlice({
  name: 'importOrders',
  initialState,
  reducers: {
    clearImportOrdersError: (state) => {
      state.error = null;
    },
    setImporting: (state, action) => {
      state.isImporting = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchImportedOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImportedOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchImportedOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch orders';
      })
      // Fetch integrations
      .addCase(fetchIntegrations.fulfilled, (state, action) => {
        state.integrations = action.payload;
      })
      // Add order
      .addCase(addImportedOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      // Toggle integration
      .addCase(toggleIntegration.fulfilled, (state, action) => {
        const index = state.integrations.findIndex(integration => integration.id === action.payload.id);
        if (index !== -1) {
          state.integrations[index] = action.payload;
        }
      });
  },
});

export const { clearImportOrdersError, setImporting } = importOrdersSlice.actions;
export default importOrdersSlice.reducer;