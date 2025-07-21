import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { receiptsApi } from '../api/supabaseApi';
import { Receipt, ApiError } from '../types';

interface ReceiptState {
  receipts: Receipt[];
  isLoading: boolean;
  error: string | null;
  totalAmount: number;
  taxDeductibleAmount: number;
}

const initialState: ReceiptState = {
  receipts: [],
  isLoading: false,
  error: null,
  totalAmount: 0,
  taxDeductibleAmount: 0,
};

export const fetchReceipts = createAsyncThunk<
  Receipt[],
  { userId: string },
  { rejectValue: ApiError }
>(
  'receipts/fetchReceipts',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await receiptsApi.fetchReceipts(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch receipts',
        code: error.code,
      });
    }
  }
);

export const addReceipt = createAsyncThunk<
  Receipt,
  { receipt: Omit<Receipt, 'id'> },
  { rejectValue: ApiError }
>(
  'receipts/addReceipt',
  async ({ receipt }, { rejectWithValue }) => {
    try {
      return await receiptsApi.addReceipt(receipt);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to add receipt',
        code: error.code,
      });
    }
  }
);

export const updateReceipt = createAsyncThunk<
  Receipt,
  { receipt: Receipt },
  { rejectValue: ApiError }
>(
  'receipts/updateReceipt',
  async ({ receipt }, { rejectWithValue }) => {
    try {
      return await receiptsApi.updateReceipt(receipt);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to update receipt',
        code: error.code,
      });
    }
  }
);

export const deleteReceipt = createAsyncThunk<
  string,
  { receiptId: string },
  { rejectValue: ApiError }
>(
  'receipts/deleteReceipt',
  async ({ receiptId }, { rejectWithValue }) => {
    try {
      return await receiptsApi.deleteReceipt(receiptId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to delete receipt',
        code: error.code,
      });
    }
  }
);

const receiptSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    clearReceiptError: (state) => {
      state.error = null;
    },
    calculateTotals: (state) => {
      state.totalAmount = state.receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
      state.taxDeductibleAmount = state.receipts
        .filter(receipt => receipt.taxDeductible)
        .reduce((sum, receipt) => sum + receipt.amount, 0);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch receipts
      .addCase(fetchReceipts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receipts = action.payload;
        receiptSlice.caseReducers.calculateTotals(state);
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch receipts';
      })
      // Add receipt
      .addCase(addReceipt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReceipt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receipts.unshift(action.payload);
        receiptSlice.caseReducers.calculateTotals(state);
      })
      .addCase(addReceipt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to add receipt';
      })
      // Update receipt
      .addCase(updateReceipt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReceipt.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.receipts.findIndex(receipt => receipt.id === action.payload.id);
        if (index !== -1) {
          state.receipts[index] = action.payload;
        }
        receiptSlice.caseReducers.calculateTotals(state);
      })
      .addCase(updateReceipt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update receipt';
      })
      // Delete receipt
      .addCase(deleteReceipt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReceipt.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receipts = state.receipts.filter(receipt => receipt.id !== action.payload);
        receiptSlice.caseReducers.calculateTotals(state);
      })
      .addCase(deleteReceipt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete receipt';
      });
  },
});

export const { clearReceiptError, calculateTotals } = receiptSlice.actions;
export default receiptSlice.reducer;