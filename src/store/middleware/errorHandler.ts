import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Error handling middleware for Redux actions
export const errorHandlerMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Log all rejected actions for debugging
  if (action.type.endsWith('/rejected')) {
    console.error('Redux Action Failed:', {
      type: action.type,
      error: action.payload,
      timestamp: new Date().toISOString()
    });

    // You can add additional error handling logic here
    // For example, showing toast notifications, logging to external services, etc.
    
    // Show user-friendly error messages for specific errors
    if (action.payload?.message) {
      const errorMessage = action.payload.message;
      
      // Handle specific error types
      if (errorMessage.includes('Network')) {
        console.warn('Network error detected, user might be offline');
      } else if (errorMessage.includes('Permission denied')) {
        console.warn('Permission error, user might need to re-authenticate');
      } else if (errorMessage.includes('Rate limit')) {
        console.warn('Rate limit exceeded, should implement retry logic');
      }
    }
  }

  // Log successful actions in development
  if (process.env.NODE_ENV === 'development' && action.type.endsWith('/fulfilled')) {
    console.log('Redux Action Succeeded:', {
      type: action.type,
      timestamp: new Date().toISOString()
    });
  }

  return next(action);
};

// Retry middleware for failed network requests
export const retryMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Add retry logic for specific failed actions
  if (action.type.endsWith('/rejected') && action.payload?.code === 'NETWORK_ERROR') {
    // Implement retry logic here if needed
    console.log('Network error detected, consider implementing retry logic');
  }

  return next(action);
};