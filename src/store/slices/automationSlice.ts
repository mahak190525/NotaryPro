import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { automationApi } from '../api/supabaseApi';
import { ApiError } from '../types';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  triggerType: 'time_before' | 'time_after' | 'specific_date';
  triggerValue: string;
  isActive: boolean;
  lastTriggered?: string;
  timesTriggered: number;
  userId: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'appointment' | 'follow_up' | 'marketing' | 'reminder';
  timesUsed: number;
  timesSent: number;
  userId: string;
}

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  category: 'confirmation' | 'reminder' | 'update' | 'marketing';
  timesSent: number;
  userId: string;
}

interface AutomationState {
  reminders: Reminder[];
  emailTemplates: EmailTemplate[];
  smsTemplates: SMSTemplate[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AutomationState = {
  reminders: [],
  emailTemplates: [],
  smsTemplates: [],
  isLoading: false,
  error: null,
};

// Async thunks for reminders
export const fetchReminders = createAsyncThunk<
  Reminder[],
  { userId: string },
  { rejectValue: ApiError }
>(
  'automation/fetchReminders',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await automationApi.fetchReminders(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch reminders',
        code: error.code,
      });
    }
  }
);

export const addReminder = createAsyncThunk<
  Reminder,
  { reminder: Omit<Reminder, 'id'> },
  { rejectValue: ApiError }
>(
  'automation/addReminder',
  async ({ reminder }, { rejectWithValue }) => {
    try {
      return await automationApi.addReminder(reminder);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to add reminder',
        code: error.code,
      });
    }
  }
);

export const updateReminder = createAsyncThunk<
  Reminder,
  { reminder: Reminder },
  { rejectValue: ApiError }
>(
  'automation/updateReminder',
  async ({ reminder }, { rejectWithValue }) => {
    try {
      return await automationApi.updateReminder(reminder);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to update reminder',
        code: error.code,
      });
    }
  }
);

export const deleteReminder = createAsyncThunk<
  string,
  { reminderId: string },
  { rejectValue: ApiError }
>(
  'automation/deleteReminder',
  async ({ reminderId }, { rejectWithValue }) => {
    try {
      return await automationApi.deleteReminder(reminderId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to delete reminder',
        code: error.code,
      });
    }
  }
);

// Async thunks for email templates
export const fetchEmailTemplates = createAsyncThunk<
  EmailTemplate[],
  { userId: string },
  { rejectValue: ApiError }
>(
  'automation/fetchEmailTemplates',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await automationApi.fetchEmailTemplates(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch email templates',
        code: error.code,
      });
    }
  }
);

export const addEmailTemplate = createAsyncThunk<
  EmailTemplate,
  { template: Omit<EmailTemplate, 'id'> },
  { rejectValue: ApiError }
>(
  'automation/addEmailTemplate',
  async ({ template }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          user_id: template.userId,
          name: template.name,
          subject: template.subject,
          content: template.content,
          category: template.category,
          times_used: template.timesUsed,
          times_sent: template.timesSent,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        subject: data.subject,
        content: data.content,
        category: data.category,
        timesUsed: data.times_used,
        timesSent: data.times_sent,
        userId: data.user_id,
      };
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to add email template',
        code: error.code,
      });
    }
  }
);

// Async thunks for SMS templates
export const fetchSMSTemplates = createAsyncThunk<
  SMSTemplate[],
  { userId: string },
  { rejectValue: ApiError }
>(
  'automation/fetchSMSTemplates',
  async ({ userId }, { rejectWithValue }) => {
    try {
      return await automationApi.fetchSMSTemplates(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.message || 'Failed to fetch SMS templates',
        code: error.code,
      });
    }
  }
);

const automationSlice = createSlice({
  name: 'automation',
  initialState,
  reducers: {
    clearAutomationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reminders
      .addCase(fetchReminders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reminders = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch reminders';
      })
      // Add reminder
      .addCase(addReminder.fulfilled, (state, action) => {
        state.reminders.unshift(action.payload);
      })
      // Update reminder
      .addCase(updateReminder.fulfilled, (state, action) => {
        const index = state.reminders.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      // Delete reminder
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.reminders = state.reminders.filter(r => r.id !== action.payload);
      })
      // Email templates
      .addCase(fetchEmailTemplates.fulfilled, (state, action) => {
        state.emailTemplates = action.payload;
      })
      .addCase(addEmailTemplate.fulfilled, (state, action) => {
        state.emailTemplates.unshift(action.payload);
      })
      // SMS templates
      .addCase(fetchSMSTemplates.fulfilled, (state, action) => {
        state.smsTemplates = action.payload;
      });
  },
});

export const { clearAutomationError } = automationSlice.actions;
export default automationSlice.reducer;