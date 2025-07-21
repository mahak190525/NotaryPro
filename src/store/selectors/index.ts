import { RootState } from '../index';
import { createSelector } from '@reduxjs/toolkit';

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// User profile selectors
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserLoading = (state: RootState) => state.user.isLoading;
export const selectUserError = (state: RootState) => state.user.error;

// Receipts selectors
export const selectReceipts = (state: RootState) => state.receipts.receipts;
export const selectReceiptsLoading = (state: RootState) => state.receipts.isLoading;
export const selectReceiptsError = (state: RootState) => state.receipts.error;
export const selectReceiptsTotalAmount = (state: RootState) => state.receipts.totalAmount;
export const selectReceiptsTaxDeductible = (state: RootState) => state.receipts.taxDeductibleAmount;

// Journal selectors
export const selectJournalEntries = (state: RootState) => state.journal.entries;
export const selectJournalLoading = (state: RootState) => state.journal.isLoading;
export const selectJournalError = (state: RootState) => state.journal.error;
export const selectJournalTotalFees = (state: RootState) => state.journal.totalFees;
export const selectJournalCompletedEntries = (state: RootState) => state.journal.completedEntries;

// Mileage selectors
export const selectMileageTrips = (state: RootState) => state.mileage.trips;
export const selectMileageLoading = (state: RootState) => state.mileage.isLoading;
export const selectMileageError = (state: RootState) => state.mileage.error;
export const selectMileageTotalMiles = (state: RootState) => state.mileage.totalMiles;
export const selectMileageBusinessMiles = (state: RootState) => state.mileage.businessMiles;
export const selectMileageTotalDeduction = (state: RootState) => state.mileage.totalDeduction;

// Settings selectors
export const selectSettings = (state: RootState) => state.settings.settings;
export const selectSettingsLoading = (state: RootState) => state.settings.isLoading;
export const selectSettingsError = (state: RootState) => state.settings.error;

// Automation selectors
export const selectReminders = (state: RootState) => state.automation.reminders;
export const selectEmailTemplates = (state: RootState) => state.automation.emailTemplates;
export const selectSMSTemplates = (state: RootState) => state.automation.smsTemplates;
export const selectAutomationLoading = (state: RootState) => state.automation.isLoading;
export const selectAutomationError = (state: RootState) => state.automation.error;

// Import Orders selectors
export const selectImportedOrders = (state: RootState) => state.importOrders.orders;
export const selectIntegrations = (state: RootState) => state.importOrders.integrations;
export const selectImportOrdersLoading = (state: RootState) => state.importOrders.isLoading;
export const selectImportOrdersError = (state: RootState) => state.importOrders.error;

// Computed selectors using createSelector for memoization
export const selectReceiptsByCategory = createSelector(
  [selectReceipts],
  (receipts) => {
    const categories: { [key: string]: number } = {};
    receipts.forEach(receipt => {
      categories[receipt.category] = (categories[receipt.category] || 0) + receipt.amount;
    });
    return categories;
  }
);

export const selectMonthlyRevenue = createSelector(
  [selectJournalEntries],
  (entries) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return entries
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entry.status === 'completed' && 
               entryDate.getMonth() === currentMonth && 
               entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.notaryFee, 0);
  }
);

export const selectMonthlyExpenses = createSelector(
  [selectReceipts],
  (receipts) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return receipts
      .filter(receipt => {
        const receiptDate = new Date(receipt.date);
        return receiptDate.getMonth() === currentMonth && 
               receiptDate.getFullYear() === currentYear;
      })
      .reduce((sum, receipt) => sum + receipt.amount, 0);
  }
);

export const selectBusinessMileageThisMonth = createSelector(
  [selectMileageTrips],
  (trips) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return trips
      .filter(trip => {
        const tripDate = new Date(trip.date);
        return trip.category === 'business' && 
               tripDate.getMonth() === currentMonth && 
               tripDate.getFullYear() === currentYear;
      })
      .reduce((sum, trip) => sum + trip.distance, 0);
  }
);

export const selectActiveReminders = createSelector(
  [selectReminders],
  (reminders) => reminders.filter(reminder => reminder.isActive)
);

export const selectConnectedIntegrations = createSelector(
  [selectIntegrations],
  (integrations) => integrations.filter(integration => integration.isConnected)
);

export const selectDashboardStats = createSelector(
  [selectMonthlyRevenue, selectMonthlyExpenses, selectBusinessMileageThisMonth, selectJournalEntries],
  (revenue, expenses, mileage, entries) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyAppointments = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && 
             entryDate.getFullYear() === currentYear;
    }).length;

    return {
      monthlyRevenue: revenue,
      monthlyExpenses: expenses,
      monthlyMileage: mileage,
      monthlyAppointments,
      netIncome: revenue - expenses
    };
  }
);