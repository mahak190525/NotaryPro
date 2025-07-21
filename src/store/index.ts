import { configureStore } from '@reduxjs/toolkit';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import receiptReducer from './slices/receiptSlice';
import journalReducer from './slices/journalSlice';
import mileageReducer from './slices/mileageSlice';
import automationReducer from './slices/automationSlice';
import importOrdersReducer from './slices/importOrdersSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    receipts: receiptReducer,
    journal: journalReducer,
    mileage: mileageReducer,
    automation: automationReducer,
    importOrders: importOrdersReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(errorHandlerMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;