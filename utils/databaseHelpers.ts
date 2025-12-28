// utils/databaseHelpers.ts
import { supabase } from './supabase';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Booking {
  id: string;
  service_name: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress';
  service_categories: {
    icon: string;
    color: string;
  };
  customer_id: string;
  provider_id?: string;
}

export interface Provider {
  id: string;
  business_name: string;
  business_type: string;
  rating: number;
  total_jobs: number;
  is_available: boolean;
  profiles: {
    full_name: string;
    email?: string;
    phone?: string;
  } | null;
}

// Fetch service categories with proper typing
export const fetchServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data as ServiceCategory[];
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return [];
  }
};

// Fetch bookings with proper joins
export const fetchRecentBookings = async (userId: string): Promise<Booking[]> => {
  try {
    // First, get bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        service_name,
        booking_time,
        status,
        service_id,
        customer_id
      `)
      .eq('customer_id', userId)
      .order('booking_time', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!bookings || bookings.length === 0) return [];

    // Get service IDs
    const serviceIds = bookings
      .map(b => b.service_id)
      .filter(Boolean) as string[];

    let servicesData: any[] = [];
    if (serviceIds.length > 0) {
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, category_id')
        .in('id', serviceIds);

      if (!servicesError && services) {
        servicesData = services;
      }
    }

    // Get category IDs
    const categoryIds = servicesData
      .map(s => s.category_id)
      .filter(Boolean) as string[];

    let categoriesData: any[] = [];
    if (categoryIds.length > 0) {
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select('id, icon, color')
        .in('id', categoryIds);

      if (!categoriesError && categories) {
        categoriesData = categories;
      }
    }

    // Create mapping
    const categoryMap = categoriesData.reduce((acc, category) => {
      acc[category.id] = category;
      return acc;
    }, {});

    const serviceMap = servicesData.reduce((acc, service) => {
      acc[service.id] = service;
      return acc;
    }, {});

    // Format bookings
    const formattedBookings: Booking[] = bookings.map(booking => {
      const service = serviceMap[booking.service_id];
      const category = service ? categoryMap[service.category_id] : null;

      return {
        id: booking.id,
        service_name: booking.service_name || 'Service',
        booking_time: booking.booking_time,
        status: booking.status || 'pending',
        customer_id: booking.customer_id,
        service_categories: {
          icon: category?.icon || 'construct-outline',
          color: category?.color || '#0d9488'
        }
      };
    });

    return formattedBookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};

// Fetch featured providers
export const fetchFeaturedProviders = async (): Promise<Provider[]> => {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        id,
        business_name,
        business_type,
        rating,
        total_jobs,
        is_available,
        profiles (
          full_name,
          email,
          phone
        )
      `)
      .order('rating', { ascending: false })
      .limit(5);

    if (error) throw error;

    return data as Provider[];
  } catch (error) {
    console.error('Error fetching providers:', error);
    return [];
  }
};

// Fetch user profile with stats
export const fetchUserProfileWithStats = async (userId: string) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get booking count
    const { count: bookingsCount, error: bookingsError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', userId);

    // Get favorites count
    const { count: favoritesCount, error: favoritesError } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      ...profile,
      stats: {
        bookings: bookingsCount || 0,
        favorites: favoritesCount || 0,
        memberSince: calculateMemberSince(profile.created_at)
      }
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

const calculateMemberSince = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInMonths = (now.getFullYear() - createdDate.getFullYear()) * 12 + 
                     (now.getMonth() - createdDate.getMonth());
  
  if (diffInMonths < 1) return 'New';
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
  
  const years = Math.floor(diffInMonths / 12);
  return `${years} year${years > 1 ? 's' : ''}`;
};