
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { 
  Conversation, 
  ConversationMetadata, 
  Message, 
  ConversationType 
} from "../types/conversationTypes";
import { toast } from "sonner";

// Helper function to safely parse metadata from Supabase response
export const parseMetadata = (metadataRaw: any): ConversationMetadata => {
  if (!metadataRaw) return {};
  
  if (typeof metadataRaw !== 'object') return {};
  
  // Handle object case
  return {
    linkedDocumentId: typeof metadataRaw.linkedDocumentId === 'string' ? metadataRaw.linkedDocumentId : undefined,
    jobDescription: typeof metadataRaw.jobDescription === 'string' ? metadataRaw.jobDescription : undefined,
    attachments: Array.isArray(metadataRaw.attachments) ? metadataRaw.attachments : undefined
  };
};

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
      type: item.type as ConversationType,
      metadata: parseMetadata(item.metadata)
    }));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    toast.error('Failed to load conversations');
    return [];
  }
};

// Fetch a specific conversation and its messages
export const fetchConversation = async (id: string): Promise<{ conversation: Conversation | null, messages: Message[] }> => {
  try {
    // Get the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (conversationError) throw conversationError;

    // Get the messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;

    return { 
      conversation: conversation ? {
        ...conversation,
        type: conversation.type as ConversationType,
        metadata: parseMetadata(conversation.metadata)
      } : null, 
      messages: messages?.map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant'
      })) || []
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    toast.error('Failed to load conversation');
    return { conversation: null, messages: [] };
  }
};

// Create a new conversation
export const createConversation = async (
  title: string, 
  type: ConversationType,
  metadata?: ConversationMetadata
): Promise<Conversation | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        title, 
        type,
        user_id: user.id,
        metadata: metadata as Json // Cast to Json type for Supabase
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      type: data.type as ConversationType,
      metadata: parseMetadata(data.metadata)
    };
  } catch (error) {
    console.error('Error creating conversation:', error);
    toast.error('Failed to create conversation');
    return null;
  }
};

// Update an existing conversation
export const updateConversation = async (id: string, updates: Partial<Conversation>): Promise<Conversation | null> => {
  try {
    const updatesWithMetadata = {
      ...updates,
      metadata: updates.metadata as Json // Cast to Json type for Supabase
    };
    
    const { data, error } = await supabase
      .from('conversations')
      .update({ 
        ...updatesWithMetadata, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      type: data.type as ConversationType,
      metadata: parseMetadata(data.metadata)
    };
  } catch (error) {
    console.error('Error updating conversation:', error);
    toast.error('Failed to update conversation');
    return null;
  }
};

// Delete a conversation
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
    toast.error('Failed to delete conversation');
    return false;
  }
};

// Send a message and get AI response
export const sendMessage = async (
  conversationId: string, 
  content: string, 
  attachments: string[] = []
): Promise<{ aiResponse: Message } | null> => {
  try {
    // Save the user message
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

    // Get the conversation history for context
    const { data: previousMessages, error: previousMessagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (previousMessagesError) throw previousMessagesError;

    // Call the AI service to get a response - will be updated to use an edge function
    // For now, just create a mock response
    const aiResponse = `I'm processing your request about: "${content}". ${
      attachments.length > 0 ? 
      `I see you've attached ${attachments.length} file(s). Let me analyze that for you.` : 
      "This is a placeholder response until the AI edge function is implemented."
    }`;

    // Save the AI response
    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponse
      })
      .select()
      .single();

    if (assistantMessageError) throw assistantMessageError;

    return {
      aiResponse: {
        ...assistantMessage,
        role: assistantMessage.role as 'user' | 'assistant'
      }
    };
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Failed to send message');
    return null;
  }
};

// Create a conversation with specialized AI advisor
export const createSpecializedConversation = async (
  type: ConversationType, 
  documentId?: string,
  jobDescription?: string
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
        title = 'LinkedIn Optimization';
        break;
      default:
        title = 'Career Advice';
    }
    
    const metadata: ConversationMetadata = {};
    
    if (documentId) {
      metadata.linkedDocumentId = documentId;
    }
    
    if (jobDescription) {
      metadata.jobDescription = jobDescription;
    }
    
    const conversation = await createConversation(title, type, metadata);
    
    if (!conversation) throw new Error('Failed to create conversation');
    
    // Add an initial assistant message to guide the user
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      role: 'assistant',
      content: `Welcome to your ${title.toLowerCase()} session. I'm here to help you with ${
        type === 'resume' ? 'improving your resume' :
        type === 'interview_prep' ? 'preparing for your upcoming interview' :
        type === 'cover_letter' ? 'crafting an effective cover letter' :
        type === 'job_search' ? 'developing an effective job search strategy' :
        type === 'linkedin' ? 'optimizing your LinkedIn profile' :
        'your career questions'
      }. What specific assistance do you need today?`
    });
    
    return conversation;
  } catch (error) {
    console.error('Error creating specialized conversation:', error);
    toast.error('Failed to create specialized chat');
    return null;
  }
};

// Create a default conversation if none exists
export const createDefaultConversation = async (): Promise<Conversation | null> => {
  try {
    const conversations = await fetchConversations();
    
    // If user already has conversations, don't create a new one
    if (conversations.length > 0) {
      return conversations[0]; // Return the most recent conversation
    }
    
    // Create a new general advisor conversation
    return createSpecializedConversation('general');
  } catch (error) {
    console.error('Error creating default conversation:', error);
    toast.error('Failed to create default conversation');
    return null;
  }
};
