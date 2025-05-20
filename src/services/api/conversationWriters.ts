import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Conversation, ConversationMetadata, ConversationType } from "../types/conversationTypes";
import { asConversationType, parseMetadata } from "./conversationApiUtils";
import { getWelcomeMessageForType } from "../utils/conversationUtils";

/**
 * Update an existing conversation
 */
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
      updateData.metadata = updates.metadata as unknown as Json;
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

/**
 * Delete a conversation and its messages
 */
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

// Note: Other methods like createConversation, createSpecializedConversation, and createDefaultConversation
// have been moved to conversationCreators.ts to reduce file size and improve code organization
