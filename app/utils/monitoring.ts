// Monitoring & Error Tracking Setup
// In production: use Sentry (free tier available)

// For Sentry integration (recommended):
// npm install @sentry/react-native

// Example integration:
// import { initSentry } from '@sentry/react-native';
// initSentry({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN });

export const MONITORING_CONFIG = {
  appName: 'HandyHub',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  trackingEnabled: process.env.NODE_ENV === 'production',
  endpoints: {
    errors: 'https://sentry.io/api/your-project',
    analytics: 'https://analytics.handhub.app/track',
  },
};

// Track key user events for analytics
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export const trackEvent = (event: AnalyticsEvent) => {
  if (!MONITORING_CONFIG.trackingEnabled) {
    console.log('[Analytics]', event.event, event.properties);
    return;
  }
  // Send to analytics endpoint
  console.log('[Analytics]', event.event, event.properties);
};

// Key business events to track
export const EVENT_TYPES = {
  USER_SIGNUP: 'user.signup',
  USER_LOGIN: 'user.login',
  SERVICE_BOOKED: 'service.booked',
  SERVICE_COMPLETED: 'service.completed',
  REVIEW_SUBMITTED: 'review.submitted',
  PROVIDER_REGISTERED: 'provider.registered',
  BOOKING_CANCELLED: 'booking.cancelled',
} as const;
