
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types/conversationTypes';

// Fetch all messages for a conversation
export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    // Fetch messages from the database
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data as Message[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Fetch the most recent message for a conversation
export const fetchLatestMessage = async (conversationId: string): Promise<Message | null> => {
  try {
    // Fetch the latest message from the database
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No messages found
        return null;
      }
      throw error;
    }
    
    return data as Message;
  } catch (error) {
    console.error('Error fetching latest message:', error);
    throw error;
  }
};
