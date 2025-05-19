
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "../types/conversationTypes";
import { asConversationType, parseMetadata } from "./conversationApiUtils";

/**
 * Fetch all conversations for the current user
 */
export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(item => ({
      ...item,
      type: asConversationType(item.type),
      metadata: parseMetadata(item.metadata)
    } as Conversation));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

/**
 * Fetch a single conversation and its messages by ID
 */
export const fetchConversation = async (id: string): Promise<{ conversation: Conversation | null, messages: Message[] }> => {
  try {
    // Get conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (conversationError) throw conversationError;

    // Get messages for this conversation
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    const parsedConversation = conversation ? {
      ...conversation,
      type: asConversationType(conversation.type),
      metadata: parseMetadata(conversation.metadata)
    } as Conversation : null;

    const parsedMessages = (messagesData || []).map(msg => ({
      ...msg,
      role: (msg.role === 'user' || msg.role === 'assistant') ? msg.role : 'assistant'
    } as Message));

    return { 
      conversation: parsedConversation, 
      messages: parsedMessages
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { conversation: null, messages: [] };
  }
};
