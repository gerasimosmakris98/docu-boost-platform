import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Conversation, ConversationMetadata, Message, ConversationType } from "../types/conversationTypes";
import { getChatPromptForType, getWelcomeMessageForType } from "../utils/conversationUtils";

// Fetch all conversations for the current user
export const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Fetch a single conversation and its messages by ID
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
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return { 
      conversation: conversation || null, 
      messages: messages || [] 
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
    
    // Use type assertion to convert metadata to Json
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title,
        type,
        user_id: user.id,
        metadata: metadata as unknown as Json
      })
      .select()
      .single();

    if (error) throw error;
    return data;
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
    // If metadata is being updated, properly type it
    const updatedData: any = { ...updates };
    if (updates.metadata) {
      updatedData.metadata = updates.metadata as unknown as Json;
    }
    
    const { data, error } = await supabase
      .from('conversations')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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

// Send a message to the conversation and get an AI response
export const sendMessage = async (
  conversationId: string, 
  content: string,
  attachments: string[] = []
): Promise<{ aiResponse: Message } | null> => {
  try {
    // Insert user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
        attachments
      })
      .select()
      .single();

    if (userMessageError) throw userMessageError;

    // Get conversation details for context
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (conversationError) throw conversationError;

    // Simulate AI response (this will be replaced with actual AI integration)
    const aiResponseContent = `I'm your AI assistant. You said: "${content}"${
      attachments.length > 0 ? ` and shared ${attachments.length} attachment(s)` : ''
    }. How can I help you further?`;

    // Insert AI response
    const { data: aiMessage, error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponseContent
      })
      .select()
      .single();

    if (aiMessageError) throw aiMessageError;

    return {
      aiResponse: aiMessage
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Create a specialized conversation for a specific purpose
export const createSpecializedConversation = async (
  type: ConversationType,
  documentId?: string,
  jobDescription?: string
): Promise<Conversation | null> => {
  try {
    let title = '';
    const metadata: ConversationMetadata = {};
    
    if (documentId) {
      metadata.linkedDocumentId = documentId;
    }
    
    if (jobDescription) {
      metadata.jobDescription = jobDescription;
    }
    
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
        title = 'LinkedIn Optimization';
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
      
      return recent;
    }
    
    // Otherwise create a new general conversation
    return createSpecializedConversation('general');
  } catch (error) {
    console.error('Error creating default conversation:', error);
    // If all else fails, just create a general conversation
    return createSpecializedConversation('general');
  }
};
