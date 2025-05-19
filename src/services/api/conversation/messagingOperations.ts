
import { supabase } from "@/integrations/supabase/client";
import { ConversationMessage, ConversationType } from "../../types/conversationTypes";
import { asConversationType } from "../utils/conversationApiUtils";
import { generateChatResponse } from "../chatApi";

// Send a message to the conversation and get an AI response
export const sendMessage = async (
  conversationId: string, 
  content: string,
  attachments: string[] = []
): Promise<{ aiResponse: any } | null> => {
  try {
    // Get conversation type to customize AI response
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .select('type')
      .eq('id', conversationId)
      .single();
    
    if (convError) {
      console.error('Error getting conversation type:', convError);
      throw convError;
    }
    
    const conversationType = asConversationType(conversationData.type);

    // Insert user message
    const { data: userMsgData, error: userMessageError } = await supabase
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

    // Get conversation history for context
    const { data: historyData, error: historyError } = await supabase
      .from('messages')
      .select('id, conversation_id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10); // Limit to avoid token limits

    if (historyError) throw historyError;

    // Format message history to ConversationMessage array
    const messageHistory: ConversationMessage[] = historyData.map(msg => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      created_at: msg.created_at
    }));

    // Get AI response via chatApi
    const aiResponseContent = await generateChatResponse(
      content,
      messageHistory,
      conversationType,
      attachments
    );

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

    const aiResponse = {
      id: aiMessageData.id,
      conversation_id: aiMessageData.conversation_id,
      role: 'assistant',
      content: aiMessageData.content,
      created_at: aiMessageData.created_at
    };

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return { aiResponse };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};
