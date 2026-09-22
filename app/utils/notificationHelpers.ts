import { Alert } from 'react-native';
import { supabase } from './supabase';

export async function sendNotification(userId: string, title: string, message: string, type: string) {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.log('Notification storage error:', e);
  }
}

export async function getUnreadNotifications(userId: string) {
  try {
    const { data } = await supabase.from('notifications')
      .select('*').eq('user_id', userId).eq('read', false)
      .order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}
