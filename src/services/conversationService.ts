
import { supabase } from "@/integrations/supabase/client";
import { aiService } from "./aiService";
import { toast } from "sonner";

export type ConversationType = 'resume' | 'cover_letter' | 'interview_prep' | 'general';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  type: ConversationType;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id?: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
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
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
      return [];
    }
  },

  // Fetch a single conversation with its messages
  async getConversation(id: string): Promise<{conversation: Conversation | null; messages: Message[]}> {
    try {
      // Fetch the conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (conversationError) throw conversationError;
      
      if (!conversation) {
        return { conversation: null, messages: [] };
      }

      // Fetch the messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      return { 
        conversation, 
        messages: messages || []
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Failed to load conversation');
      return { conversation: null, messages: [] };
    }
  },

  // Create a new conversation
  async createConversation(title: string, type: ConversationType): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ title, type }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  },

  // Send a message and get AI response
  async sendMessage(conversation_id: string, content: string): Promise<{userMessage: Message | null; aiResponse: Message | null}> {
    try {
      // Insert user message
      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert([{ conversation_id, role: 'user', content }])
        .select()
        .single();

      if (userMessageError) throw userMessageError;

      // Get conversation type for context
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .select('type')
        .eq('id', conversation_id)
        .single();

      if (conversationError) throw conversationError;

      // Get previous messages for context (limit to last 10 for performance)
      const { data: previousMessages, error: previousMessagesError } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (previousMessagesError) throw previousMessagesError;

      // Create context for the AI based on conversation type and history
      const conversationType = conversation.type;
      const messageHistory = previousMessages?.reverse() || [];
      
      // Get AI response
      const aiContent = await aiService.generateChatResponse(content, messageHistory, conversationType);

      // Insert AI response
      const { data: aiMessage, error: aiMessageError } = await supabase
        .from('messages')
        .insert([{ conversation_id, role: 'assistant', content: aiContent }])
        .select()
        .single();

      if (aiMessageError) throw aiMessageError;

      // Update conversation last updated time
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);

      return { userMessage, aiResponse: aiMessage };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return { userMessage: null, aiResponse: null };
    }
  },

  // Delete a conversation and its messages (cascade delete will handle messages)
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
};
