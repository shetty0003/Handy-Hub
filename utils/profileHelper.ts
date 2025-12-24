// utils/profileHelper.ts
import { supabase } from './supabase';

export const ensureUserProfile = async (userId: string, userEmail: string, metadata: any) => {
  try {
    // Try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
    }

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile if doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        full_name: metadata?.full_name || userEmail?.split('@')[0] || 'User',
        user_type: metadata?.user_type || 'customer',
        phone: metadata?.phone || null,
        verification_status: metadata?.user_type === 'provider' ? 'pending' : 'unverified',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      throw createError;
    }

    return newProfile;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        providers (*)
      `)
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to avoid PGRST116 error

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};