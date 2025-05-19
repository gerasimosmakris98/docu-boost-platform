
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ConversationType = 'general' | 'resume_feedback' | 'interview_prep' | 'cover_letter' | 'job_search';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  type: ConversationType;
  created_at: string;
  updated_at: string;
  metadata?: {
    linkedDocumentId?: string;
    jobDescription?: string;
    attachments?: string[];
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  attachments?: string[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const conversationService = {
  // Fetch user's conversations
  async getConversations(): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        type: item.type as ConversationType,
        metadata: item.metadata || {}
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
      return [];
    }
  },

  // Fetch a specific conversation with its messages
  async getConversation(id: string): Promise<{ conversation: Conversation | null, messages: Message[] }> {
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
          metadata: conversation.metadata || {}
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
  },

  // Create a new conversation
  async createConversation(
    title: string, 
    type: ConversationType,
    metadata?: {
      linkedDocumentId?: string;
      jobDescription?: string;
    }
  ): Promise<Conversation | null> {
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
          metadata
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        type: data.type as ConversationType,
        metadata: data.metadata || {}
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  },

  // Update a conversation
  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        type: data.type as ConversationType,
        metadata: data.metadata || {}
      };
    } catch (error) {
      console.error('Error updating conversation:', error);
      toast.error('Failed to update conversation');
      return null;
    }
  },

  // Delete a conversation
  async deleteConversation(id: string): Promise<boolean> {
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
  },

  // Chat with AI - this will handle sending user messages and receiving AI responses
  async sendMessage(
    conversationId: string, 
    content: string, 
    attachments: string[] = []
  ): Promise<Message | null> {
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
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (conversationError) throw conversationError;

      const { data: previousMessages, error: previousMessagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (previousMessagesError) throw previousMessagesError;

      // Format messages for the AI
      const messageHistory: ConversationMessage[] = previousMessages
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Call the AI service to get a response - will be updated to use an edge function
      // For now, just create a mock response
      const aiResponse = `I'm processing your request about: "${content}". This is a placeholder response until the AI edge function is implemented.`;

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
        ...assistantMessage,
        role: assistantMessage.role as 'user' | 'assistant'
      };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return null;
    }
  },

  // Get specialized chat contexts for different document types
  getChatPromptForType(type: ConversationType, documentContent?: string, jobDescription?: string): string {
    switch (type) {
      case 'resume_feedback':
        return `You are a resume specialist. Here's a resume: "${documentContent}". Please provide detailed feedback.`;
      case 'interview_prep':
        return `You are an interview coach. The job description is: "${jobDescription}". Provide interview preparation guidance.`;
      case 'cover_letter':
        return `You are a cover letter expert. Here's a job description: "${jobDescription}". Please help craft an impressive cover letter.`;
      case 'job_search':
        return 'You are a job search strategist. Provide detailed advice for finding and applying to jobs effectively.';
      default:
        return 'You are a helpful career assistant. How can I help you with your career goals today?';
    }
  },

  // Create a specialized conversation for a specific purpose (resume review, interview prep, etc.)
  async createSpecializedConversation(
    type: ConversationType, 
    documentId?: string,
    jobDescription?: string
  ): Promise<Conversation | null> {
    try {
      let title = '';
      
      switch (type) {
        case 'resume_feedback':
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
        default:
          title = 'General Career Advice';
      }
      
      const conversation = await this.createConversation(title, type, {
        linkedDocumentId: documentId,
        jobDescription
      });
      
      if (!conversation) throw new Error('Failed to create conversation');
      
      // Add an initial assistant message to guide the user
      await supabase.from('messages').insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: `Welcome to your ${title.toLowerCase()} session. I'm here to help you with ${
          type === 'resume_feedback' ? 'improving your resume' :
          type === 'interview_prep' ? 'preparing for your upcoming interview' :
          type === 'cover_letter' ? 'crafting an effective cover letter' :
          type === 'job_search' ? 'developing an effective job search strategy' :
          'your career questions'
        }. What specific assistance do you need today?`
      });
      
      return conversation;
    } catch (error) {
      console.error('Error creating specialized conversation:', error);
      toast.error('Failed to create specialized chat');
      return null;
    }
  }
};
