import { supabase } from './supabase';

export async function getConversations(userId: string) {
  try {
    const { data } = await supabase.from('messages')
      .select('*, sender:sender_id(full_name, avatar_url), receiver:receiver_id(full_name, avatar_url)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  try {
    const { data, error } = await supabase.from('messages').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      read: false,
      created_at: new Date().toISOString()
    }).select().single();
    return { data, error };
  } catch (e) {
    return { data: null, error: e };
  }
}

export async function getMessages(senderId: string, receiverId: string) {
  try {
    const { data } = await supabase.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .order('created_at', { ascending: true });
    return data || [];
  } catch {
    return [];
  }
}
