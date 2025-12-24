// utils/profileHelper.ts
import { supabase } from './supabase';

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