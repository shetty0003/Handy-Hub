import { supabase } from './supabase';
import { z } from 'zod';

export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  radius: z.number().min(1).max(100).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  sortBy: z.enum(['rating', 'price', 'distance', 'availability']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export type SearchParams = z.infer<typeof searchSchema>;

export interface SearchResult {
  id: string;
  business_name: string;
  business_type: string;
  rating: number;
  total_jobs: number;
  service_categories: string[];
  service_areas: string[];
  hourly_rate: number | null;
  is_available: boolean;
  is_verified: boolean;
  distance?: number;
  profiles?: { full_name: string; avatar_url: string }[] | { full_name: string; avatar_url: string } | null;
  services?: Array<{
    id: string;
    name: string;
    price: number;
    category_id: string;
    service_categories: { name: string } | null;
  }>;
}

export async function searchProviders(params: SearchParams): Promise<{ data: SearchResult[]; total: number; error?: string }> {
  const validation = searchSchema.safeParse(params);
  if (!validation.success) {
    return { data: [], total: 0, error: validation.error.issues[0]?.message || 'Invalid search parameters' };
  }

  const { query, category, location, minPrice, maxPrice, radius, lat, lng, sortBy, page, limit } = validation.data;
  const offset = (page - 1) * limit;

  try {
    let queryBuilder = supabase
      .from('providers')
      .select(`
        id,
        business_name,
        business_type,
        rating,
        total_jobs,
        service_categories,
        service_areas,
        hourly_rate,
        is_available,
        is_verified,
        profiles (full_name, avatar_url),
        services (id, name, price, category_id, service_categories (name))
      `, { count: 'exact' })
      .eq('is_verified', true)
      .eq('is_available', true)
      .range(offset, offset + limit - 1);

    // Text search on business name and type
    if (query) {
      queryBuilder = queryBuilder.or(`business_name.ilike.%${query}%,business_type.ilike.%${query}%`);
    }

    // Category filter
    if (category) {
      queryBuilder = queryBuilder.contains('service_categories', [category]);
    }

    // Location filter (PostGIS if available, otherwise text search on service_areas)
    if (location) {
      queryBuilder = queryBuilder.contains('service_areas', [location]);
    }

    // Price filters
    if (minPrice !== undefined) {
      queryBuilder = queryBuilder.gte('hourly_rate', minPrice);
    }
    if (maxPrice !== undefined) {
      queryBuilder = queryBuilder.lte('hourly_rate', maxPrice);
    }

    // Sorting
    switch (sortBy) {
      case 'rating':
        queryBuilder = queryBuilder.order('rating', { ascending: false });
        break;
      case 'price':
        queryBuilder = queryBuilder.order('hourly_rate', { ascending: true, nullsFirst: false });
        break;
      case 'availability':
        queryBuilder = queryBuilder.order('is_available', { ascending: false });
        break;
      default:
        queryBuilder = queryBuilder.order('rating', { ascending: false });
    }

    const { data, error, count } = await queryBuilder;

    if (error) {
      return { data: [], total: 0, error: error.message };
    }

    return { data: (data as unknown as SearchResult[]) || [], total: count || 0 };
  } catch (error) {
    return { data: [], total: 0, error: 'Search failed' };
  }
}

// Advanced: Search with PostGIS distance (if enabled)
export async function searchProvidersNearby(
  lat: number,
  lng: number,
  radiusKm: number,
  category?: string
): Promise<{ data: SearchResult[]; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('search_providers_nearby', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radiusKm,
      category_filter: category,
    });

    if (error) {
      // Fallback to text-based location search
      return searchProviders({ location: '', lat, lng, radius: radiusKm, category, page: 1, limit: 20 });
    }

    return { data: data || [], error: undefined };
  } catch {
    return { data: [], error: 'Nearby search unavailable' };
  }
}

// Search suggestions / autocomplete
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];

  try {
    const { data: categories } = await supabase
      .from('service_categories')
      .select('name')
      .ilike('name', `%${query}%`)
      .limit(5);

    const { data: providers } = await supabase
      .from('providers')
      .select('business_name, business_type')
      .or(`business_name.ilike.%${query}%,business_type.ilike.%${query}%`)
      .eq('is_verified', true)
      .eq('is_available', true)
      .limit(5);

    const suggestions = [
      ...(categories?.map(c => c.name) || []),
      ...(providers?.map(p => p.business_name) || []),
      ...(providers?.map(p => p.business_type) || []),
    ];

    // Deduplicate
    return [...new Set(suggestions)].slice(0, 8);
  } catch {
    return [];
  }
}

// Search by service
export async function searchServices(params: {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}): Promise<{ data: any[]; total: number; error?: string }> {
  const { query, categoryId, minPrice, maxPrice, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  try {
    let qb = supabase
      .from('services')
      .select(`
        *,
        providers (business_name, business_type, rating, is_verified),
        service_categories (name, icon, color)
      `, { count: 'exact' })
      .eq('is_active', true)
      .eq('providers.is_verified', true)
      .range(offset, offset + limit - 1);

    if (query) {
      qb = qb.ilike('name', `%${query}%`);
    }
    if (categoryId) {
      qb = qb.eq('category_id', categoryId);
    }
    if (minPrice !== undefined) {
      qb = qb.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      qb = qb.lte('price', maxPrice);
    }

    const { data, error, count } = await qb;
    return { data: data || [], total: count || 0, error: error?.message };
  } catch {
    return { data: [], total: 0, error: 'Service search failed' };
  }
}

export function getDefaultCategories() {
  return [
    { id: 'cleaning', name: 'Cleaning', icon: 'home-outline', color: '#10b981' },
    { id: 'plumbing', name: 'Plumbing', icon: 'wrench-outline', color: '#06b6d4' },
    { id: 'electrical', name: 'Electrical', icon: 'zap-outline', color: '#f59e0b' },
    { id: 'gardening', name: 'Gardening', icon: 'leaf-outline', color: '#84cc16' },
    { id: 'painting', name: 'Painting', icon: 'paintbrush-outline', color: '#ef4444' },
    { id: 'assembly', name: 'Assembly', icon: 'construct-outline', color: '#8b5cf6' },
    { id: 'repair', name: 'Repair', icon: 'hammer-outline', color: '#6366f1' },
    { id: 'moving', name: 'Moving', icon: 'truck-outline', color: '#14b8a6' },
  ];
}