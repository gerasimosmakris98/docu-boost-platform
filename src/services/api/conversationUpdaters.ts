
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Conversation } from "../types/conversationTypes";
import { asConversationType, parseMetadata } from "./conversationApiUtils";

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
