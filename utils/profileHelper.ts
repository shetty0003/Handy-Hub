// utils/profileHelper.ts
import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  user_type: string;
  verification_status: string;
  created_at: string;
  updated_at?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface ProviderInfo {
  id: string;
  business_name: string;
  business_type: string;
  business_address?: string;
  years_of_experience?: number;
  license_number?: string;
  tax_id?: string;
  rating: number;
  total_jobs: number;
  weekly_earnings?: number;
  completed_jobs?: number;
  active_jobs?: number;
  total_earnings?: number;
  available_balance?: number;
  pending_balance?: number;
  is_available?: boolean;
  verification_status?: string;
  approval_status?: string;
  service_radius?: number;
  created_at: string;
  updated_at?: string;
  is_verified?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface ServiceRequest {
  id: string;
  customer_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  preferred_date?: string;
  preferred_time?: string;
  estimated_budget?: number;
  urgency: 'urgent' | 'normal' | 'flexible';
  status: 'pending' | 'matched' | 'accepted' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  profiles?: UserProfile;
}

export interface MatchedProvider {
  id: string;
  business_name: string;
  business_type: string;
  rating: number;
  total_jobs: number;
  years_of_experience?: number;
  distance?: number;
  estimated_price?: number;
  response_time?: number;
  is_available: boolean;
  is_verified: boolean;
  match_score: number;
  reason?: string;
  profile?: UserProfile;
}

// Haversine distance calculation
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getUserProfile = async (userId: string): Promise<{ 
  profile: UserProfile | null; 
  provider: ProviderInfo | null 
}> => {
  try {
    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error getting user profile:', profileError);
      return { profile: null, provider: null };
    }

    // Get provider info if user is a provider
    let providerData = null;
    if (profileData?.user_type === 'provider') {
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!providerError && provider) {
        providerData = {
          ...provider,
          is_verified: provider.verification_status === 'verified' && 
                      (provider.approval_status === 'approved' || !provider.approval_status),
          is_available: provider.is_available ?? true
        };
      }
    }

    return { 
      profile: profileData as UserProfile | null, 
      provider: providerData as ProviderInfo | null 
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return { profile: null, provider: null };
  }
};

export const updateProviderAvailability = async (userId: string, isAvailable: boolean) => {
  try {
    const { error } = await supabase
      .from('providers')
      .update({ 
        is_available: isAvailable, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Main matching algorithm
export const findMatchingProviders = async (requestData: {
  category: string;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  minRating?: number;
  maxPrice?: number;
  preferredDate?: Date;
  urgency?: 'urgent' | 'normal' | 'flexible';
}): Promise<MatchedProvider[]> => {
  try {
    console.log('Finding matching providers for:', requestData);
    
    // Step 1: Get all verified and available providers in the category
    let query = supabase
      .from('providers')
      .select(`
        *,
        profiles:profiles!inner (
          id,
          full_name,
          email,
          latitude,
          longitude,
          address
        )
      `)
      .eq('is_available', true)
      .eq('business_type', requestData.category)
      .or('verification_status.is.null,verification_status.eq.verified')
      .or('approval_status.is.null,approval_status.eq.approved');

    const { data: providers, error } = await query;

    if (error) {
      console.error('Error fetching providers:', error);
      return [];
    }

    if (!providers || providers.length === 0) {
      console.log('No providers found for category:', requestData.category);
      return [];
    }

    console.log(`Found ${providers.length} providers to evaluate`);

    // Step 2: Calculate match scores
    const matchedProviders: MatchedProvider[] = [];

    for (const provider of providers) {
      let matchScore = 0;
      const reasons: string[] = [];

      // A. Location matching (40% weight)
      if (requestData.latitude && requestData.longitude && 
          provider.profiles?.latitude && provider.profiles?.longitude) {
        
        const distance = calculateDistance(
          requestData.latitude,
          requestData.longitude,
          provider.profiles.latitude,
          provider.profiles.longitude
        );

        const maxRadius = provider.service_radius || 50; // Default 50km
        const maxSearchRadius = requestData.maxDistance || 50;
        
        if (distance <= maxRadius && distance <= maxSearchRadius) {
          const distanceScore = Math.max(0, 40 - (distance / maxRadius * 40));
          matchScore += distanceScore;
          reasons.push(`Within ${distance.toFixed(1)}km`);
        } else {
          console.log(`Provider ${provider.business_name} is ${distance.toFixed(1)}km away, outside radius`);
          continue; // Skip providers outside service radius
        }
      }

      // B. Rating matching (30% weight)
      const rating = provider.rating || 0;
      const ratingScore = (rating / 5) * 30;
      matchScore += ratingScore;
      reasons.push(`${rating.toFixed(1)}★ rating`);

      // C. Experience matching (20% weight)
      const experience = provider.years_of_experience || 0;
      const experienceScore = Math.min(20, experience * 2);
      matchScore += experienceScore;
      if (experience > 0) {
        reasons.push(`${experience} years experience`);
      }

      // D. Job completion rate (10% weight)
      const totalJobs = provider.total_jobs || 0;
      const completedJobs = provider.completed_jobs || 0;
      if (totalJobs > 0) {
        const completionRate = completedJobs / totalJobs;
        const completionScore = completionRate * 10;
        matchScore += completionScore;
        reasons.push(`${completedJobs} jobs completed`);
      }

      // Apply urgency multiplier for urgent requests
      if (requestData.urgency === 'urgent') {
        matchScore *= 1.2;
        reasons.push('Urgent priority');
      }

      // Ensure match score is between 0-100
      matchScore = Math.min(100, Math.round(matchScore));

      // Only include if above minimum threshold
      const minThreshold = 50;
      if (matchScore >= minThreshold) {
        matchedProviders.push({
          id: provider.id,
          business_name: provider.business_name,
          business_type: provider.business_type,
          rating: rating,
          total_jobs: totalJobs,
          years_of_experience: experience,
          is_available: provider.is_available,
          is_verified: provider.verification_status === 'verified' && 
                     (provider.approval_status === 'approved' || !provider.approval_status),
          match_score: matchScore,
          reason: reasons.join(' • '),
          profile: provider.profiles
        });
      }
    }

    // Step 3: Sort by match score (highest first)
    const sortedProviders = matchedProviders.sort((a, b) => b.match_score - a.match_score);
    
    console.log(`Found ${sortedProviders.length} matching providers`);
    return sortedProviders;

  } catch (error) {
    console.error('Error in findMatchingProviders:', error);
    return [];
  }
};

// Create service request
export const createServiceRequest = async (requestData: {
  customer_id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  preferred_date?: string;
  preferred_time?: string;
  estimated_budget?: number;
  urgency?: 'urgent' | 'normal' | 'flexible';
}) => {
  try {
    // Create service_requests record
    const { data: request, error: requestError } = await supabase
      .from('service_requests')
      .insert({
        ...requestData,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Find matching providers
    const matchedProviders = await findMatchingProviders({
      category: requestData.category,
      latitude: requestData.latitude,
      longitude: requestData.longitude,
      urgency: requestData.urgency
    });

    // Create matches in a separate table (optional)
    if (matchedProviders.length > 0) {
      const matches = matchedProviders.map(provider => ({
        request_id: request.id,
        provider_id: provider.id,
        match_score: provider.match_score,
        status: 'pending'
      }));

      await supabase
        .from('request_matches')
        .insert(matches);

      // Update request status
      await supabase
        .from('service_requests')
        .update({ status: 'matched' })
        .eq('id', request.id);
    }

    return { 
      request, 
      matchedProviders, 
      error: null 
    };
  } catch (error) {
    console.error('Error creating service request:', error);
    return { 
      request: null, 
      matchedProviders: [], 
      error 
    };
  }
};

// Accept job request
export const acceptJobRequest = async (requestId: string, providerId: string) => {
  try {
    // Update request status
    const { error: requestError } = await supabase
      .from('service_requests')
      .update({ 
        status: 'accepted',
        accepted_provider_id: providerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (requestError) throw requestError;

    // Update match status
    await supabase
      .from('request_matches')
      .update({ status: 'accepted' })
      .eq('request_id', requestId)
      .eq('provider_id', providerId);

    // Reject other matches
    await supabase
      .from('request_matches')
      .update({ status: 'rejected' })
      .eq('request_id', requestId)
      .neq('provider_id', providerId);

    return { error: null };
  } catch (error) {
    console.error('Error accepting job request:', error);
    return { error };
  }
};

// Get provider's service requests
export const getJobRequests = async (providerId?: string, status?: string) => {
  try {
    let query = supabase
      .from('service_requests')
      .select(`
        *,
        profiles:customer_id (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });

    if (providerId && status === 'accepted') {
      query = query.eq('accepted_provider_id', providerId);
    } else if (providerId) {
      // Get requests matched to this provider
      const { data: matches } = await supabase
        .from('request_matches')
        .select('request_id')
        .eq('provider_id', providerId);

      if (matches && matches.length > 0) {
        const requestIds = matches.map(m => m.request_id);
        query = query.in('id', requestIds);
      }
    }

    if (status && status !== 'All') {
      query = query.eq('status', status.toLowerCase());
    }

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Get matched providers for a request
export const getRequestMatches = async (requestId: string) => {
  try {
    const { data, error } = await supabase
      .from('request_matches')
      .select(`
        *,
        providers:provider_id (
          *,
          profiles:profiles (
            full_name,
            email,
            latitude,
            longitude,
            address
          )
        )
      `)
      .eq('request_id', requestId)
      .order('match_score', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};