import { supabase } from './supabase';
import { handleError } from './errorHandler';
import { z } from 'zod';
import { validateSchema, type ValidationResult } from './validation';

// ============================================
// SERVICE SCHEMAS
// ============================================

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required').max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  categoryId: z.string().uuid('Invalid category').optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// ============================================
// SERVICE HELPER FUNCTIONS
// ============================================

export async function getProviderServices(providerId: string) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      const { userMessage } = handleError(error, 'getProviderServices');
      return { services: [], error: userMessage };
    }

    return { services: data || [], error: null };
  } catch (error) {
    const { userMessage } = handleError(error, 'getProviderServices');
    return { services: [], error: userMessage };
  }
}

export async function createService(providerId: string, serviceData: z.infer<typeof createServiceSchema>) {
  const validation = validateSchema(createServiceSchema, serviceData);
  if (!validation.success) {
    return { success: false, error: 'Invalid service data', errors: validation.errors };
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .insert({
        ...validation.data,
        provider_id: providerId,
      })
      .select()
      .single();

    if (error) {
      const { userMessage } = handleError(error, 'createService');
      return { success: false, error: userMessage };
    }

    return { success: true, data };
  } catch (error) {
    const { userMessage } = handleError(error, 'createService');
    return { success: false, error: userMessage };
  }
}

export async function updateService(serviceId: string, updates: z.infer<typeof updateServiceSchema>) {
  const validation = validateSchema(updateServiceSchema, updates);
  if (!validation.success) {
    return { success: false, error: 'Invalid service data', errors: validation.errors };
  }

  try {
    const { data, error } = await supabase
      .from('services')
      .update(validation.data)
      .eq('id', serviceId)
      .select()
      .single();

    if (error) {
      const { userMessage } = handleError(error, 'updateService');
      return { success: false, error: userMessage };
    }

    return { success: true, data };
  } catch (error) {
    const { userMessage } = handleError(error, 'updateService');
    return { success: false, error: userMessage };
  }
}

export async function deleteService(serviceId: string) {
  try {
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', serviceId);

    if (error) {
      const { userMessage } = handleError(error, 'deleteService');
      return { success: false, error: userMessage };
    }

    return { success: true };
  } catch (error) {
    const { userMessage } = handleError(error, 'deleteService');
    return { success: false, error: userMessage };
  }
}

// ============================================
// BOOKING HELPER FUNCTIONS
// ============================================

export interface CreateBookingData {
  providerId: string;
  serviceId?: string;
  serviceName: string;
  bookingTime: string;
  address: string;
  totalAmount: number;
  specialInstructions?: string;
}

export async function createBooking(
  customerId: string,
  bookingData: CreateBookingData
) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        provider_id: bookingData.providerId,
        service_id: bookingData.serviceId,
        service_name: bookingData.serviceName,
        booking_time: bookingData.bookingTime,
        status: 'pending',
        total_amount: bookingData.totalAmount,
        address: bookingData.address,
        special_instructions: bookingData.specialInstructions || '',
      })
      .select()
      .single();

    if (error) {
      const { userMessage } = handleError(error, 'createBooking');
      return { success: false, error: userMessage };
    }

    return { success: true, data };
  } catch (error) {
    const { userMessage } = handleError(error, 'createBooking');
    return { success: false, error: userMessage };
  }
}

export async function getCustomerBookings(customerId: string) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', customerId)
      .order('booking_time', { ascending: false })
      .limit(20);

    if (error) {
      const { userMessage } = handleError(error, 'getCustomerBookings');
      return { bookings: [], error: userMessage };
    }

    return { bookings: data || [], error: null };
  } catch (error) {
    const { userMessage } = handleError(error, 'getCustomerBookings');
    return { bookings: [], error: userMessage };
  }
}

export async function getProviderBookings(providerId: string) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', providerId)
      .order('booking_time', { ascending: false });

    if (error) {
      const { userMessage } = handleError(error, 'getProviderBookings');
      return { bookings: [], error: userMessage };
    }

    return { bookings: data || [], error: null };
  } catch (error) {
    const { userMessage } = handleError(error, 'getProviderBookings');
    return { bookings: [], error: userMessage };
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      const { userMessage } = handleError(error, 'updateBookingStatus');
      return { success: false, error: userMessage };
    }

    return { success: true, data };
  } catch (error) {
    const { userMessage } = handleError(error, 'updateBookingStatus');
    return { success: false, error: userMessage };
  }
}
