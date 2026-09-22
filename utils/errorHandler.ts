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
export interface HandledError {
  userMessage: string;
  logMessage: string;
  code?: string;
}

/**
 * Shared error handler used by the screens and the helper modules.
 * Returns a message that is safe to show to the user plus a message
 * intended for logs.
 */
export function handleError(error: unknown, context: string = 'unknown'): HandledError {
  const err = error as { message?: string; code?: string; stack?: string } | null | undefined;
  const errorMessage = err?.message || String(error) || 'An unknown error occurred';

  let userMessage = AuthErrorHandler.handleAuthError({ message: errorMessage });

  // Provider/database specific cases handled before the auth fallback
  if (errorMessage.includes('already exists')) {
    userMessage = 'Provider profile already exists for this user.';
  } else if (errorMessage.includes('not authenticated') || errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
    userMessage = 'Session expired. Please log in again.';
  } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden') || errorMessage.includes('policy')) {
    userMessage = "You don't have permission to perform this action.";
  } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
    userMessage = 'The requested resource was not found.';
  } else if (errorMessage.includes('check constraint') || errorMessage.includes('422')) {
    userMessage = 'Please check your information and try again.';
  } else if (errorMessage.includes('429')) {
    userMessage = 'Too many requests. Please wait a moment and try again.';
  } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
    userMessage = 'The request took too long. Please check your connection and try again.';
  }

  const logMessage = `[${context}] ${err?.stack || errorMessage}`;

  return { userMessage, logMessage, code: err?.code };
}
