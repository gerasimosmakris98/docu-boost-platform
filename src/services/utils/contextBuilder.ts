
import { supabase } from "@/integrations/supabase/client";
import { ConversationType, ConversationMetadata } from "../types/conversationTypes";

export interface UserContext {
  profileInfo: string | null;
  conversationHistory: string;
  userPreferences: ConversationMetadata;
  conversationType: ConversationType;
}

export const buildUserContext = async (
  userId: string,
  conversationId: string,
  conversationType: ConversationType
): Promise<UserContext> => {
  try {
    // Get user profile information
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let profileInfo = null;
    if (profile) {
      const profileParts = [];
      if (profile.full_name) profileParts.push(`Name: ${profile.full_name}`);
      if (profile.title) profileParts.push(`Current Title: ${profile.title}`);
      if (profile.location) profileParts.push(`Location: ${profile.location}`);
      if (profile.summary) profileParts.push(`Professional Summary: ${profile.summary}`);
      if (profile.headline) profileParts.push(`Headline: ${profile.headline}`);
      
      if (profileParts.length > 0) {
        profileInfo = `User Profile:\n${profileParts.join('\n')}`;
      }
    }

    // Get conversation metadata for user preferences
    const { data: conversation } = await supabase
      .from('conversations')
      .select('metadata')
      .eq('id', conversationId)
      .single();

    // Safely handle metadata type conversion
    let userPreferences: ConversationMetadata = {};
    if (conversation?.metadata) {
      if (typeof conversation.metadata === 'object' && conversation.metadata !== null) {
        userPreferences = conversation.metadata as ConversationMetadata;
      }
    }

    // Get recent conversation history for context
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);

    let conversationHistory = '';
    if (recentMessages && recentMessages.length > 1) {
      // Skip the current message being processed
      const contextMessages = recentMessages.slice(1).reverse();
      conversationHistory = contextMessages
        .map(msg => `${msg.role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`)
        .join('\n');
    }

    return {
      profileInfo,
      conversationHistory,
      userPreferences,
      conversationType
    };
  } catch (error) {
    console.error('Error building user context:', error);
    return {
      profileInfo: null,
      conversationHistory: '',
      userPreferences: {},
      conversationType
    };
  }
};

export const generateContextualPrompt = (
  userMessage: string,
  context: UserContext,
  systemPrompt: string
): string => {
  const parts = [systemPrompt];

  // Add user profile information if available
  if (context.profileInfo) {
    parts.push(`\nUser Information:\n${context.profileInfo}`);
  }

  // Add conversation context if available
  if (context.conversationHistory) {
    parts.push(`\nConversation Context:\n${context.conversationHistory}`);
  }

  // Add conversation type specific guidance
  parts.push(`\nConversation Type: ${context.conversationType}`);
  
  // Add behavioral guidelines
  parts.push(`
Guidelines for this conversation:
- Always respond in context of being a ${context.conversationType} advisor
- If this is the user's first message, ask about their background and goals
- Build on previous conversation context when available
- Be personalized based on user's profile information
- Ask clarifying questions to better understand their needs
- Provide actionable, specific advice
- Keep responses conversational and supportive`);

  // Add the user's current message
  parts.push(`\nUser's current message: ${userMessage}`);

  return parts.join('\n');
};
