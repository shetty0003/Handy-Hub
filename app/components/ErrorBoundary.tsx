import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============================================
// ERROR STATE PROPS
// ============================================

interface ErrorInfoProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onDismiss
}: ErrorInfoProps) {
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="warning-outline" size={48} color="#ef4444" style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// GLOBAL ERROR BOUNDARY
// ============================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error for monitoring (replace with your logging service)
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Show alert for critical errors in production
    if (!__DEV__) {
      Alert.alert(
        'Something went wrong',
        'We\'ve encountered an error. Your progress has been saved.',
        [{ text: 'OK', onPress: () => this.resetError() }]
      );
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(
            this.state.error!,
            this.state.errorInfo!,
            this.resetError
          );
        }
        return this.props.fallback;
      }

      // Default fallback
      return (
        <View style={styles.container}>
          <Ionicons name="warning" size={64} color="#ef4444" style={styles.icon} />
          <Text style={styles.title}>Something Went Wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          {this.state.errorInfo && __DEV__ && (
            <Text style={styles.debugInfo}>
              {this.state.errorInfo.componentStack}
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.retryButton} onPress={this.resetError}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// ============================================
// SPECIFIC ERROR BOUNDARIES
// ============================================

interface ScreenErrorBoundaryProps {
  children: ReactNode;
  screenName: string;
}

export function ScreenErrorBoundary({ children, screenName }: ScreenErrorBoundaryProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error(`Error in ${screenName}:`, error, errorInfo);
      }}
      fallback={(error, _, resetError) => (
        <View style={styles.screenErrorContainer}>
          <Ionicons name="warning" size={48} color="#ef4444" />
          <Text style={styles.screenErrorTitle}>
            Can&apos;t load {screenName}
          </Text>
          <Text style={styles.screenErrorMessage}>
            {error.message || 'Please try refreshing this screen.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={resetError}>
            <Text style={styles.retryText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// ============================================
// ERROR HANDLER UTILITY
// ============================================

export function handleError(
  error: unknown,
  context: string = 'unknown'
): { userMessage: string; logMessage: string } {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Determine user-friendly message
  let userMessage = 'Something went wrong. Please try again.';

  if (errorMessage.includes('Network request failed') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('NetworkError')) {
    userMessage = 'Unable to connect. Please check your internet connection and try again.';
  } else if (errorMessage.includes('User already registered') ||
             errorMessage.includes('duplicate key')) {
    userMessage = 'This account already exists. Please try logging in instead.';
  } else if (errorMessage.includes('Invalid login credentials')) {
    userMessage = 'Invalid email or password. Please check your credentials.';
  } else if (errorMessage.includes('Email not confirmed')) {
    userMessage = 'Please verify your email address before logging in. Check your inbox for the verification link.';
  } else if (errorMessage.includes('rate limit')) {
    userMessage = 'Too many attempts. Please wait a few minutes before trying again.';
  } else if (errorMessage.includes('not authenticated') ||
             errorMessage.includes('401') ||
             errorMessage.includes('unauthorized')) {
    userMessage = 'Session expired. Please log in again.';
  } else if (errorMessage.includes('403') ||
             errorMessage.includes('Forbidden') ||
             errorMessage.includes('policy')) {
    userMessage = 'You don\'t have permission to perform this action.';
  } else if (errorMessage.includes('404') ||
             errorMessage.includes('Not Found')) {
    userMessage = 'The requested resource was not found.';
  } else if (errorMessage.includes('422') ||
             errorMessage.includes('Unprocessable') ||
             errorMessage.includes('check constraint')) {
    userMessage = 'Please check your information and try again.';
  } else if (errorMessage.includes('429')) {
    userMessage = 'Too many requests. Please wait a moment and try again.';
  } else if (errorMessage.includes('Timeout') ||
             errorMessage.includes('timeout')) {
    userMessage = 'The request took too long. Please check your connection and try again.';
  }

  // Log message for developers
  const logMessage = `[${context}] ${error instanceof Error ? error.stack || errorMessage : String(error)}`;

  return { userMessage, logMessage };
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
  },
  retryButton: {
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 12,
    marginTop: 8,
  },
  dismissText: {
    color: '#64748b',
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    margin: 20,
  },
  screenErrorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  screenErrorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  screenErrorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  debugInfo: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'Courier',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    maxWidth: '100%',
  },
});
