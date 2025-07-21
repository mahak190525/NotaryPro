import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { journalApi } from '../api/supabaseApi';
import { JournalEntry, ApiError } from '../types';

interface JournalState {
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  totalFees: number;
  completedEntries: number;
}

const initialState: JournalState = {
  entries: [],
  isLoading: false,
  error: null,
  totalFees: 0,
  completedEntries: 0,
};

export const fetchJournalEntries = createAsyncThunk<
  JournalEntry[],
  { userId: string },
  { rejectValue: ApiError }
>(
  'journal/fetchEntries',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await journalApi.fetchEntries(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch journal entries',
        code: error.code,
      });
    }
  }
);

export const addJournalEntry = createAsyncThunk<
  JournalEntry,
  { entry: Omit<JournalEntry, 'id'> },
  { rejectValue: ApiError }
>(
  'journal/addEntry',
  async ({ entry }, { rejectWithValue }) => {
    try {
      return await journalApi.addEntry(entry);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to add journal entry',
        code: error.code,
      });
    }
  }
);

export const updateJournalEntry = createAsyncThunk<
  JournalEntry,
  { entry: JournalEntry },
  { rejectValue: ApiError }
>(
  'journal/updateEntry',
  async ({ entry }, { rejectWithValue }) => {
    try {
      return await journalApi.updateEntry(entry);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to update journal entry',
        code: error.code,
      });
    }
  }
);

export const deleteJournalEntry = createAsyncThunk<
  string,
  { entryId: string },
  { rejectValue: ApiError }
>(
  'journal/deleteEntry',
  async ({ entryId }, { rejectWithValue }) => {
    try {
      return await journalApi.deleteEntry(entryId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to delete journal entry',
        code: error.code,
      });
    }
  }
);

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    clearJournalError: (state) => {
      state.error = null;
    },
    calculateStats: (state) => {
      state.totalFees = state.entries
        .filter(entry => entry.status === 'completed')
        .reduce((sum, entry) => sum + entry.notaryFee, 0);
      state.completedEntries = state.entries.filter(entry => entry.status === 'completed').length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch entries
      .addCase(fetchJournalEntries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = action.payload;
        journalSlice.caseReducers.calculateStats(state);
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch journal entries';
      })
      // Add entry
      .addCase(addJournalEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries.unshift(action.payload);
        journalSlice.caseReducers.calculateStats(state);
      })
      .addCase(addJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to add journal entry';
      })
      // Update entry
      .addCase(updateJournalEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.entries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        journalSlice.caseReducers.calculateStats(state);
      })
      .addCase(updateJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update journal entry';
      })
      // Delete entry
      .addCase(deleteJournalEntry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteJournalEntry.fulfilled, (state, action) => {
        state.isLoading = false;
        state.entries = state.entries.filter(entry => entry.id !== action.payload);
        journalSlice.caseReducers.calculateStats(state);
      })
      .addCase(deleteJournalEntry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete journal entry';
      });
  },
});

export const { clearJournalError, calculateStats } = journalSlice.actions;
export default journalSlice.reducer;