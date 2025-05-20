
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "../types/conversationTypes";
import { asConversationType, parseMetadata } from "./conversationApiUtils";

/**
 * Fetch a list of conversations for the current user
 */
export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to fetch conversations');
    }
    
    // Fetch conversations
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    // Transform data to strongly typed objects
    return data ? data.map(item => ({
      ...item,
      type: asConversationType(item.type),
      metadata: parseMetadata(item.metadata)
    })) as Conversation[] : [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

/**
 * Fetch a single conversation and its messages
 */
export const fetchConversation = async (id: string): Promise<{ conversation: Conversation | null; messages: Message[] }> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to fetch a conversation');
    }
    
    // Fetch the conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (conversationError) throw conversationError;
    
    // Fetch the messages for this conversation
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;
    
    const conversation = conversationData ? {
      ...conversationData,
      type: asConversationType(conversationData.type),
      metadata: parseMetadata(conversationData.metadata)
    } as Conversation : null;
    
    const messages = messagesData || [];
    
    return { conversation, messages };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { conversation: null, messages: [] };
  }
};
