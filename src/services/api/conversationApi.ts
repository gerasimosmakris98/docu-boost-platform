import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Conversation, ConversationMetadata, Message, ConversationType } from "../types/conversationTypes";
import { openaiService } from "../openaiService";
import { getChatPromptForType } from "../utils/conversationUtils";

// Helper function to safely convert string to ConversationType
const asConversationType = (type: string): ConversationType => {
  const validTypes: ConversationType[] = ['general', 'resume', 'interview_prep', 'cover_letter', 'job_search', 'linkedin', 'assessment'];
  return validTypes.includes(type as ConversationType) 
    ? (type as ConversationType) 
    : 'general';
};

// Helper function to safely parse metadata from Supabase response
const parseMetadata = (metadataRaw: any): ConversationMetadata => {
  if (!metadataRaw) return {};
  
  if (typeof metadataRaw !== 'object') return {};
  
  // Handle object case
  return {
    linkedDocumentId: typeof metadataRaw.linkedDocumentId === 'string' ? metadataRaw.linkedDocumentId : undefined,
    jobDescription: typeof metadataRaw.jobDescription === 'string' ? metadataRaw.jobDescription : undefined,
    attachments: Array.isArray(metadataRaw.attachments) ? metadataRaw.attachments : undefined,
    linkedinProfile: typeof metadataRaw.linkedinProfile === 'string' ? metadataRaw.linkedinProfile : undefined,
    assessmentUrl: typeof metadataRaw.assessmentUrl === 'string' ? metadataRaw.assessmentUrl : undefined,
    companyUrl: typeof metadataRaw.companyUrl === 'string' ? metadataRaw.companyUrl : undefined
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
      type: asConversationType(item.type),
      metadata: parseMetadata(item.metadata)
    } as Conversation));
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
    } as Message));

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
    // Get conversation data to determine the type
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (convError) throw convError;
    
    // Parse conversation type
    const conversationType = asConversationType(conversationData.type);
    
    // Insert user message
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
        attachments
      });

    if (userMessageError) throw userMessageError;
    
    // Get previous messages to provide context (limit to last 5 for simplicity)
    const { data: previousMessages, error: prevMsgError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (prevMsgError) throw prevMsgError;
    
    // Build context from previous messages
    let contextMessages = '';
    if (previousMessages && previousMessages.length > 0) {
      contextMessages = previousMessages
        .reverse()
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
    }
    
    // Create prompt based on conversation type and include context
    const prompt = getChatPromptForType(conversationType, content, contextMessages);
    
    // Handle file attachments if present
    let aiResponseContent = '';
    
    if (attachments && attachments.length > 0) {
      // For simplicity, we'll just analyze the first attachment
      const fileUrl = attachments[0];
      const fileName = fileUrl.split('/').pop() || 'file';
      // Determine file type from URL/name
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      let fileType = 'application/octet-stream';
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        fileType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      } else if (fileExtension === 'pdf') {
        fileType = 'application/pdf';
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileType = 'application/msword';
      }
      
      try {
        // Analyze file with OpenAI
        aiResponseContent = await openaiService.analyzeFile(fileUrl, fileName, fileType);
      } catch (fileError) {
        console.error('Error analyzing file:', fileError);
        aiResponseContent = `I couldn't analyze the file you provided. ${fileError.message || 'Please try again with a different file or format.'}`;
      }
    } else {
      // Generate AI response based on text prompt
      aiResponseContent = await openaiService.generateResponse(prompt, conversationType);
    }
    
    // Insert AI response
    const { data: aiMessageData, error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponseContent
      })
      .select()
      .single();

    if (aiMessageError) throw aiMessageError;

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    const aiResponse: Message = {
      id: aiMessageData.id,
      conversation_id: aiMessageData.conversation_id,
      role: 'assistant',
      content: aiMessageData.content,
      created_at: aiMessageData.created_at
    };

    return { aiResponse };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

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

// Import getWelcomeMessageForType from utils
import { getWelcomeMessageForType } from "../utils/conversationUtils";
