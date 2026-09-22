import { supabase } from './supabase';
import { handleError } from './errorHandler';
import { z } from 'zod';

// ============================================
// PROVIDER VERIFICATION SCHEMAS
// ============================================

export const providerRegistrationSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(200),
  businessType: z.string().min(1, 'Business type is required').max(100),
  businessAddress: z.string().min(1, 'Business address is required').max(500),
  yearsOfExperience: z.number().min(0).max(60).optional(),
  licenseNumber: z.string().optional(),
  taxId: z.string().optional(),
  hourlyRate: z.number().min(10).max(10000).optional(),
  serviceCategories: z.array(z.string()).min(1),
  serviceAreas: z.array(z.string()).min(1),
  emergencyService: z.boolean().default(false),
  warrantyOffered: z.boolean().default(false),
});

// ============================================
// PROVIDER HELPER FUNCTIONS
// ============================================

export async function getProviderProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { provider: null, error: error.message };
    }

    return { provider: data, error: null };
  } catch (error) {
    const { userMessage } = handleError(error, 'getProviderProfile');
    return { provider: null, error: userMessage };
  }
}

export async function getProviderVerification(userId: string) {
  try {
    const { data, error } = await supabase
      .from('provider_verification')
      .select('*')
      .eq('provider_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { verification: null, error: error.message };
    }

    return { verification: data || null, error: null };
  } catch (error) {
    const { userMessage } = handleError(error, 'getProviderVerification');
    return { verification: null, error: userMessage };
  }
}

export async function registerProvider(userId: string, data: z.infer<typeof providerRegistrationSchema>) {
  try {
    // Create provider record
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .insert({
        id: userId,
        business_name: data.businessName,
        business_type: data.businessType,
        business_address: data.businessAddress,
        years_of_experience: data.yearsOfExperience || 0,
        license_number: data.licenseNumber,
        tax_id: data.taxId,
        hourly_rate: data.hourlyRate,
        service_categories: data.serviceCategories,
        service_areas: data.serviceAreas,
        emergency_service: data.emergencyService,
        warranty_offered: data.warrantyOffered,
        is_verified: false,
        is_available: true,
      })
      .select()
      .single();

    if (providerError) {
      const { userMessage } = handleError(providerError, 'registerProvider');
      return { success: false, error: userMessage };
    }

    // Update profile user_type
    await supabase
      .from('profiles')
      .update({ user_type: 'provider' })
      .eq('id', userId);

    // Create verification record
    await supabase
      .from('provider_verification')
      .insert({
        provider_id: userId,
        email_verified: false,
        documents_verified: false,
        background_check_passed: false,
        verification_step: 'email_pending',
      });

    return { success: true, data: provider };
  } catch (error) {
    const { userMessage } = handleError(error, 'registerProvider');
    return { success: false, error: userMessage };
  }
}

export async function getProviderByUserId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { provider: null, error: error.message };
    }

    return { provider: data, error: null };
  } catch (error) {
    const { userMessage } = handleError(error, 'getProviderByUserId');
    return { provider: null, error: userMessage };
  }
}
