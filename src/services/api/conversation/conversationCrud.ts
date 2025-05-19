
import { supabase } from "@/integrations/supabase/client";
import { Conversation, ConversationMetadata, ConversationType } from "../../types/conversationTypes";
import { asConversationType, parseMetadata, prepareMetadataForSupabase } from "../utils/conversationApiUtils";

// Fetch all conversations for the current user
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

// Fetch a single conversation and its messages by ID
export const fetchConversation = async (id: string): Promise<{ conversation: Conversation | null, messages: any[] }> => {
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
    }));

    return { 
      conversation: parsedConversation, 
      messages: parsedMessages
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return { conversation: null, messages: [] };
  }
};

// Create a new conversation
export const createConversation = async (
  title: string, 
  type: ConversationType, 
  metadata: ConversationMetadata = {}
): Promise<Conversation | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Convert ConversationMetadata to Json type for Supabase
    const metadataJson = prepareMetadataForSupabase(metadata);
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title, 
        type,
        user_id: user.id,
        metadata: metadataJson
      })
      .select()
      .single();

    if (error) throw error;
    
    return data ? {
      ...data,
      type: asConversationType(data.type),
      metadata: parseMetadata(data.metadata)
    } as Conversation : null;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

// Update an existing conversation
export const updateConversation = async (
  id: string, 
  updates: Partial<Conversation>
): Promise<Conversation | null> => {
  try {
    // Prepare the updates for Supabase
    const updateData: any = { ...updates };
    
    // If type is provided, ensure it's a string for Supabase
    if (updates.type) {
      updateData.type = updates.type.toString();
    }
    
    // If metadata is provided, convert to Json
    if (updates.metadata) {
      updateData.metadata = prepareMetadataForSupabase(updates.metadata);
    }
    
    // Always update the timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return data ? {
      ...data,
      type: asConversationType(data.type),
      metadata: parseMetadata(data.metadata)
    } as Conversation : null;
  } catch (error) {
    console.error('Error updating conversation:', error);
    return null;
  }
};

// Delete a conversation and its messages
export const deleteConversation = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
};
