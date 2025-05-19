
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types/conversationTypes";
import { getAiResponse } from "./aiResponseHandlers";
import { formatConversationContext, asConversationType } from "./conversationApiUtils";
import { toast } from "sonner";

/**
 * Send a message to the conversation and get an AI response
 */
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
    
    // Insert user message
    const { data: userMessageData, error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
        attachments: attachments || []
      })
      .select()
      .single();

    if (userMessageError) throw userMessageError;
    
    console.log('User message saved successfully:', userMessageData.id);
    
    // Get previous messages to provide context (limit to 10 for better context)
    const { data: previousMessages, error: prevMsgError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (prevMsgError) throw prevMsgError;
    
    // Build context from previous messages
    const contextMessages = previousMessages ? 
      formatConversationContext(previousMessages.reverse()) : '';
    
    // Get AI response with fallback handling
    // Convert string to ConversationType using the utility function
    const aiResponseContent = await getAiResponse(
      asConversationType(conversationData.type),
      content,
      contextMessages,
      attachments
    );
    
    // Insert AI response
    const { data: aiMessageData, error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponseContent,
        attachments: []
      })
      .select()
      .single();

    if (aiMessageError) throw aiMessageError;
    
    console.log('AI response saved successfully');

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    console.log('Conversation timestamp updated');

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
