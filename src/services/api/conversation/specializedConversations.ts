import { ConversationMetadata, ConversationType, Conversation } from "../../types/conversationTypes";
import { supabase } from "@/integrations/supabase/client";
import { createConversation } from "./conversationCrud";
import { getWelcomeMessageForType } from "../../utils/conversationUtils";

// Create a specialized conversation for a specific purpose
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

// Create a default conversation if none exists
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
      
      if (recent) {
        return {
          ...recent,
          type: recent.type as ConversationType,
          metadata: recent.metadata as ConversationMetadata
        } as Conversation;
      }
      return null;
    }
    
    // Otherwise create a new general conversation
    return createSpecializedConversation('general');
  } catch (error) {
    console.error('Error creating default conversation:', error);
    // If all else fails, just create a general conversation
    return createSpecializedConversation('general');
  }
};
