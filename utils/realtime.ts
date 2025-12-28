// utils/realtime.ts
import { supabase } from './supabase';

// Subscribe to provider availability changes
export const subscribeToProviderAvailability = (providerId: string, callback: (isAvailable: boolean) => void) => {
  const channel = supabase
    .channel(`provider-availability-${providerId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'providers',
        filter: `id=eq.${providerId}`
      },
      (payload) => {
        callback(payload.new.is_available);
      }
    )
    .subscribe();

  return channel;
};

// Subscribe to new service requests for providers
export const subscribeToServiceRequests = (providerId: string, callback: (request: any) => void) => {
  const channel = supabase
    .channel(`service-requests-${providerId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'service_requests',
        filter: `matched_providers=cs.{${providerId}}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return channel;
};

// Subscribe to booking updates
export const subscribeToBookingUpdates = (userId: string, userType: 'customer' | 'provider', callback: (booking: any) => void) => {
  const filter = userType === 'provider' 
    ? `provider_id=eq.${userId}`
    : `customer_id=eq.${userId}`;

  const channel = supabase
    .channel(`bookings-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'booking_slots',
        filter: filter
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return channel;
};