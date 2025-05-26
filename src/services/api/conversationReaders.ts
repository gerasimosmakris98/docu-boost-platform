
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
  console.log(`Fetching conversation with ID: ${id}`);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User must be authenticated to fetch a conversation.');
      // throw new Error('User must be authenticated to fetch a conversation'); 
      // Throwing here would be caught by the generic catch. Returning explicitly might be clearer for this specific auth failure.
      return { conversation: null, messages: [] };
    }
    
    // Fetch the conversation
    console.log(`Fetching conversation record for ID: ${id}, User ID: ${user.id}`);
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (conversationError) {
      // Differentiate between "not found" (PGRST116) and other errors
      if (conversationError.code === 'PGRST116') {
        console.log(`Conversation with ID ${id} not found for user ${user.id}.`, conversationError.message);
        return { conversation: null, messages: [] };
      }
      console.error(`Error fetching conversation record for ID ${id}:`, conversationError);
      // For other errors, we also return null conversation
      return { conversation: null, messages: [] };
    }
    
    if (!conversationData) {
      // This case should ideally be covered by conversationError.code === 'PGRST116' with .single()
      // but as a safeguard:
      console.log(`Conversation with ID ${id} not found (no data returned) for user ${user.id}.`);
      return { conversation: null, messages: [] };
    }
    
    console.log(`Successfully fetched conversation data for ID: ${id}`, conversationData);
    
    const conversation = {
      ...conversationData,
      type: asConversationType(conversationData.type),
      metadata: parseMetadata(conversationData.metadata)
    } as Conversation;

    // Fetch the messages for this conversation
    let messages: Message[] = [];
    try {
      console.log(`Fetching messages for conversation ID: ${id}`);
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error(`Error fetching messages for conversation ID ${id}:`, messagesError);
        // Per requirements, return conversation data with empty messages if messages fetch fails
        // The 'conversation' variable is already populated from above.
      } else if (messagesData) {
        messages = messagesData.map(msg => ({
          ...msg,
          role: msg.role === 'user' ? 'user' : 'assistant'
        })) as Message[];
        console.log(`Successfully fetched ${messages.length} messages for conversation ID: ${id}`);
      } else {
        console.log(`No messages found for conversation ID: ${id}`);
      }
    } catch (messagesCatchError) {
      // Catch any unexpected errors during message processing itself (e.g. map function)
      console.error(`Unexpected error processing messages for conversation ID ${id}:`, messagesCatchError);
    }
    
    return { conversation, messages };

  } catch (error) { // General catch block for unexpected errors (e.g., auth.getUser error)
    console.error(`General error in fetchConversation for ID ${id}:`, error);
    return { conversation: null, messages: [] };
  }
};
