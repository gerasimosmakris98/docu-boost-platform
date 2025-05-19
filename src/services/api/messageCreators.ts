
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types/conversationTypes';
import { validateMessageContent } from './conversationUtils';

// Create a new user message
export const createUserMessage = async (
  conversationId: string,
  content: string,
  attachments?: { url: string; type: string; name: string }[]
): Promise<Message> => {
  try {
    // Validate message content
    const validatedContent = validateMessageContent(content);
    
    // Convert attachment objects to string URLs for database storage
    const attachmentUrls = attachments ? attachments.map(attachment => attachment.url) : undefined;
    
    // Insert message into the database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: validatedContent,
        attachments: attachmentUrls
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data as Message;
  } catch (error) {
    console.error('Error creating user message:', error);
    throw error;
  }
};

// Create a new AI message
export const createAiMessage = async (
  conversationId: string,
  content: string
): Promise<Message> => {
  try {
    // Validate message content
    const validatedContent = validateMessageContent(content);
    
    // Insert message into the database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: validatedContent
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data as Message;
  } catch (error) {
    console.error('Error creating AI message:', error);
    throw error;
  }
};
