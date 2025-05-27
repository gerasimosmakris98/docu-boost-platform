
import { supabase } from "@/integrations/supabase/client";
import { Conversation, ConversationType, ConversationMetadata } from "../types/conversationTypes";
import { getWelcomeMessageForType } from "../utils/welcomeMessages";

export const createSpecializedConversation = async (
  type: ConversationType, 
  metadata: ConversationMetadata = {}
): Promise<Conversation | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Create the conversation
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: "New Conversation",
        type,
        metadata
      })
      .select()
      .single();

    if (conversationError) {
      console.error("Error inserting conversation record for specialized conversation:", conversationError);
      throw conversationError;
    }

    // Cast the type to ConversationType and handle metadata properly
    const conversation: Conversation = {
      ...conversationData,
      type: conversationData.type as ConversationType,
      metadata: (conversationData.metadata as ConversationMetadata) || {}
    };

    // Insert welcome message
    const welcomeMessage = getWelcomeMessageForType(type);
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: welcomeMessage,
        attachments: [],
        source_urls: []
      });

    if (messageError) {
      console.error('Error inserting welcome message:', messageError);
      // Don't fail the conversation creation if welcome message fails
    }

    console.log(`Created ${type} conversation with welcome message:`, conversation.id);
    return conversation;
  } catch (error) {
    console.error("Error creating specialized conversation:", error);
    return null;
  }
};

export const createDefaultConversation = async (): Promise<Conversation | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Check if user has any existing conversations
    const { data: existingConversations, error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (checkError) {
      console.error("Error checking for existing conversations:", checkError);
      throw checkError;
    }

    // If user has existing conversations, create a general one
    if (existingConversations && existingConversations.length > 0) {
      return await createSpecializedConversation('general');
    }

    // For new users, create a general conversation with a special welcome
    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: "Welcome to AI Career Advisor",
        type: 'general',
        metadata: { isFirstConversation: true }
      })
      .select()
      .single();

    if (conversationError) {
      console.error("Error inserting conversation record for default conversation (new user):", conversationError);
      throw conversationError;
    }

    // Cast the type to ConversationType and handle metadata properly
    const conversation: Conversation = {
      ...conversationData,
      type: conversationData.type as ConversationType,
      metadata: (conversationData.metadata as ConversationMetadata) || {}
    };

    // Insert a special first-time welcome message
    const firstTimeWelcome = `Welcome to AI Career Advisor! 🎉

I'm here to help you succeed in your career journey. I can assist you with:
• **Resume building** and optimization
• **Cover letter** writing
• **Interview preparation** and practice
• **Job search** strategies
• **LinkedIn profile** optimization
• **Career guidance** and advice

To get started, tell me a bit about yourself:
• What's your current role or career situation?
• What brings you here today?
• What are your main career goals or challenges?

I'm excited to help you achieve your professional goals!`;

    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: firstTimeWelcome,
        attachments: [],
        source_urls: []
      });

    if (messageError) {
      console.error('Error inserting first-time welcome message:', messageError);
    }

    console.log('Created default conversation with first-time welcome:', conversation.id);
    return conversation;
  } catch (error) {
    console.error("Error creating default conversation:", error);
    return null;
  }
};

export const createConversation = async (
  title: string,
  type: ConversationType,
  metadata: ConversationMetadata = {}
): Promise<Conversation | null> => {
  return await createSpecializedConversation(type, { ...metadata, title });
};
