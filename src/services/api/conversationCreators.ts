
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Conversation, ConversationType } from "../types/conversationTypes";
import { asConversationType, parseMetadata } from "./conversationApiUtils";
import { getWelcomeMessageForType } from "../utils/conversationUtils";

/**
 * Create a new conversation
 */
export const createConversation = async (
  title: string,
  type?: ConversationType,
  metadata?: Record<string, any>
): Promise<Conversation | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create a conversation');
    }
    
    // Prepare metadata for Supabase
    const metadataJson = metadata ? metadata as unknown as Json : null;
    
    // Insert the new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title,
        user_id: user.id,
        type: type || 'general',
        metadata: metadataJson
      })
      .select()
      .single();

    if (error) throw error;
    
    // Format the response
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

/**
 * Create a specialized conversation for a specific career document type
 */
export const createSpecializedConversation = async (
  type: ConversationType
): Promise<Conversation | null> => {
  // Generate an appropriate title based on type
  let title = '';
  let metadata = {};
  
  switch (type) {
    case 'resume':
      title = 'Resume Builder';
      metadata = { documentType: 'resume' };
      break;
    case 'cover_letter':
      title = 'Cover Letter Assistant';
      metadata = { documentType: 'cover_letter' };
      break;
    case 'interview_prep':
      title = 'Interview Preparation';
      metadata = { stage: 'initial' };
      break;
    case 'linkedin':
      title = 'LinkedIn Profile Optimization';
      metadata = { platform: 'linkedin' };
      break;
    case 'job_search':
      title = 'Job Search Strategy';
      metadata = { status: 'active' };
      break;
    case 'assessment':
      title = 'Assessment Preparation';
      metadata = { assessmentType: 'general' };
      break;
    default:
      title = 'Career Conversation';
      metadata = { type: 'general' };
  }
  
  return createConversation(title, type, metadata);
};

/**
 * Create a default conversation if none exists
 */
export const createDefaultConversation = async (): Promise<Conversation | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to create a conversation');
    }
    
    // Check if user already has any conversations
    const { data: existingConversations, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
      
    if (fetchError) throw fetchError;
    
    // If conversations already exist, don't create a default one
    if (existingConversations && existingConversations.length > 0) {
      return null;
    }
    
    // Create a default general conversation
    return createConversation('Career Advisor Chat', 'general', { isDefault: true });
  } catch (error) {
    console.error('Error creating default conversation:', error);
    return null;
  }
};
