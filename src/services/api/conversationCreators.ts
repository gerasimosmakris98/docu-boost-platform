import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Conversation, ConversationMetadata, ConversationType } from "../types/conversationTypes";
import { asConversationType, parseMetadata } from "./conversationApiUtils";
import { getWelcomeMessageForType } from "../utils/conversationUtils";

/**
 * Create a new conversation
 */
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
    const metadataJson = metadata as unknown as Json;
    
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

/**
 * Create a specialized conversation for a specific purpose
 */
export const createSpecializedConversation = async (
  type: ConversationType,
  metadata: ConversationMetadata = {}
): Promise<Conversation | null> => {
  try {
    let title = '';
    
    switch (type) {
      case 'resume':
        title = 'Resume Review';
        break;
      case 'interview_prep':
        title = 'Interview Preparation';
        break;
      case 'cover_letter':
        title = 'Cover Letter Assistant';
        break;
      case 'job_search':
        title = 'Job Search Strategy';
        break;
      case 'linkedin':
        title = 'LinkedIn Profile Optimization';
        break;
      case 'assessment':
        title = 'Assessment Preparation';
        break;
      default:
        title = 'AI Career Assistant';
    }
    
    // Create the conversation
    const conversation = await createConversation(title, type, metadata);
    
    if (!conversation) {
      throw new Error('Failed to create conversation');
    }
    
    // Add an initial welcome message
    const welcomeMessage = getWelcomeMessageForType(type);
    
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: welcomeMessage
      });
    
    return conversation;
  } catch (error) {
    console.error('Error creating specialized conversation:', error);
    return null;
  }
};

/**
 * Create a default conversation if none exists
 */
export const createDefaultConversation = async (): Promise<Conversation | null> => {
  try {
    // Check if user has any conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    
    // If they have conversations, load the most recent one
    if (conversations && conversations.length > 0) {
      const { data: recent } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      return recent ? {
        ...recent,
        type: asConversationType(recent.type),
        metadata: parseMetadata(recent.metadata)
      } as Conversation : null;
    }
    
    // Otherwise create a new general conversation
    return createSpecializedConversation('general');
  } catch (error) {
    console.error('Error creating default conversation:', error);
    // If all else fails, just create a general conversation
    return createSpecializedConversation('general');
  }
};
