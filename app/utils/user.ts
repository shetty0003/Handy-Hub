import { supabase } from '../../utils/supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  user_type: string;
  verification_status: string;
  created_at: string;
  avatar_url?: string;
}

export interface ProviderInfo {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  business_address?: string;
  years_of_experience?: number;
  license_number?: string;
  tax_id?: string;
  rating: number;
  total_jobs: number;
  active_jobs: number;
  weekly_earnings: number;
  is_available: boolean;
  is_verified: boolean;
  service_categories: string[];
  hourly_rate: number;
  service_areas: string[];
  emergency_service: boolean;
  warranty_offered: boolean;
}

export async function getUserProfile(userId: string): Promise<{ profile: UserProfile | null; provider: ProviderInfo | null }> {
  try {
    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return { profile: null, provider: null };
    }

    // Get provider info if exists
    const { data: providerData, error: providerError } = await supabase
      .from('providers')
      .select('*')
      .eq('id', userId)
      .single();

    if (providerError) {
      console.error('Provider fetch error:', providerError);
      return { profile: profileData, provider: null };
    }

    return { profile: profileData, provider: providerData };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { profile: null, provider: null };
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { data: null, error };
  }
}

export async function updateProviderInfo(userId: string, updates: Partial<ProviderInfo>) {
  try {
    const { data, error } = await supabase
      .from('providers')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update provider error:', error);
    return { data: null, error };
  }
}

export async function uploadProfileImage(userId: string, fileUri: string) {
  try {
    // Convert file to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}.${fileExt}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`public/${fileName}`, blob, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(`public/${fileName}`);

    // Update profile with image URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Upload profile image error:', error);
    return { url: null, error };
  }
}

export async function getProfileImage(userId: string): Promise<string | null> {
  try {
    // First check if profile has avatar_url
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (profile?.avatar_url) {
      return profile.avatar_url;
    }

    // Try to get from storage
    const { data: files } = await supabase.storage
      .from('avatars')
      .list('public');

    const userFile = files?.find(file => file.name.startsWith(userId));
    if (userFile) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`public/${userFile.name}`);
      
      return publicUrl;
    }

    return null;
  } catch (error) {
    console.error('Get profile image error:', error);
    return null;
  }
}