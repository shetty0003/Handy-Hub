import { supabase } from './supabase';

export function subscribeToBookingUpdates(userId: string, onUpdate: (payload: any) => void) {
  const channel = supabase.channel('booking-updates')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bookings',
      filter: `customer_id=eq.${userId}`
    }, (payload) => onUpdate(payload))
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export function subscribeToProviderRequests(providerId: string, onUpdate: (payload: any) => void) {
  const channel = supabase.channel('provider-requests')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'bookings',
      filter: `provider_id=eq.${providerId}`
    }, (payload) => onUpdate(payload))
    .subscribe();
  return () => supabase.removeChannel(channel);
}
