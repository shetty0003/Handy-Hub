// utils/errorHandler.ts
export class AuthErrorHandler {
  static handleAuthError(error: any): string {
    const errorMessage = error.message || 'An unknown error occurred';
    
    // Supabase Auth specific errors
    if (errorMessage.includes('User already registered')) {
      return 'This email is already registered. Please try logging in.';
    }
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password.';
    }
    if (errorMessage.includes('Email not confirmed')) {
      return 'Please verify your email address before logging in.';
    }
    if (errorMessage.includes('Password should be at least 6 characters')) {
      return 'Password must be at least 6 characters long.';
    }
    if (errorMessage.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (errorMessage.includes('rate limit')) {
      return 'Too many attempts. Please wait a few minutes before trying again.';
    }
    
    // Network errors
    if (errorMessage.includes('Network request failed') || 
        errorMessage.includes('fetch')) {
      return 'Unable to connect. Please check your internet connection.';
    }
    
    // Database errors
    if (errorMessage.includes('duplicate key')) {
      return 'This email is already registered.';
    }
    if (errorMessage.includes('foreign key')) {
      return 'Database error. Please contact support.';
    }
    
    // Default
    return errorMessage;
  }
  
  static handleProviderError(error: any): string {
    const errorMessage = error.message || 'An unknown error occurred';
    
    if (errorMessage.includes('already exists')) {
      return 'Provider profile already exists for this user.';
    }
    if (errorMessage.includes('not authenticated')) {
      return 'Session expired. Please log in again.';
    }
    if (errorMessage.includes('check constraint')) {
      return 'Invalid data provided. Please check your information.';
    }
    
    return this.handleAuthError(error);
  }
}

// Usage in your components:
