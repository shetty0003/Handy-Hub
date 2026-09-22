import { supabase } from './supabase';
import { handleError } from './errorHandler';
import { z } from 'zod';

// ============================================
// REVIEW SCHEMAS
// ============================================

export const createReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  revieweeId: z.string().uuid('Invalid user ID'),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ============================================
// REVIEW HELPER FUNCTIONS
// ============================================

export interface ReviewData {
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

export async function createReview(reviewData: ReviewData) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        booking_id: reviewData.bookingId,
        reviewer_id: reviewData.reviewerId,
        reviewee_id: reviewData.revieweeId,
        rating: reviewData.rating,
        comment: reviewData.comment || '',
      })
      .select()
      .single();

    if (error) {
      const { userMessage } = handleError(error, 'createReview');
      return { success: false, error: userMessage };
    }

    return { success: true, data };
  } catch (error) {
    const { userMessage } = handleError(error, 'createReview');
    return { success: false, error: userMessage };
  }
}

export async function getProviderReviews(providerId: string) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewee_id', providerId)
      .order('created_at', { ascending: false });

    if (error) {
      const { userMessage } = handleError(error, 'getProviderReviews');
      return { reviews: [], error: userMessage };
    }

    return { reviews: data || [], error: null };
  } catch (error) {
    const { userMessage } = handleError(error, 'getProviderReviews');
    return { reviews: [], error: userMessage };
  }
}

export async function getReviewerReviews(reviewerId: string) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewer_id', reviewerId)
      .order('created_at', { ascending: false });

    if (error) {
      const { userMessage } = handleError(error, 'getReviewerReviews');
      return { reviews: [], error: userMessage };
    }

    return { reviews: data || [], error: null };
  } catch (error) {
    const { userMessage } = handleError(error, 'getReviewerReviews');
    return { reviews: [], error: userMessage };
  }
}

export async function getAverageRating(providerId: string) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating', { count: 'exact' })
      .eq('reviewee_id', providerId);

    if (error) {
      return { average: 0, count: 0 };
    }

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = data.reduce((sum: number, row: any) => sum + row.rating, 0);
    return {
      average: Math.round((total / data.length) * 100) / 100,
      count: data.length,
    };
  } catch {
    return { average: 0, count: 0 };
  }
}
