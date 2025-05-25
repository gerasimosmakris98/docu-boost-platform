
import { supabase } from "@/integrations/supabase/client";
import { Message, ConversationType } from "../types/conversationTypes";
import { asConversationType } from "./conversationApiUtils";
import { getAiResponse } from "./aiResponseHandlers";
import { formatConversationContext } from "../utils/conversationUtils";
import { toast } from "sonner";
import { aiProviderService } from "../ai/aiProviderService";
import { extractCleanText, extractSourceUrls, createAIResponse } from "./responseHandler";

/**
 * Send a message to the conversation and get an AI response
 */
export const sendMessage = async (
  conversationId: string, 
  content: string,
  attachments: string[] = []
): Promise<{ aiResponse: Message } | null> => {
  console.log(`sendMessage called for conversationId: ${conversationId}`);
  try {
    // Get conversation data to determine the type
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (convError) {
      console.error('Error fetching conversation:', convError);
      toast.error("Couldn't load conversation");
      throw convError;
    }
    
    const conversationType = asConversationType(conversationData.type);
    console.log(`Sending message for conversation type: ${conversationType}`);
    
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

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
      toast.error("Couldn't save your message");
      throw userMessageError;
    }
    
    console.log('User message saved successfully:', userMessageData.id);
    
    // Get previous messages to provide context
    const { data: previousMessages, error: prevMsgError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (prevMsgError) {
      console.error('Error fetching previous messages:', prevMsgError);
      throw prevMsgError;
    }
    console.log(`sendMessage (convId: ${conversationId}): Fetched ${previousMessages?.length || 0} prev messages. Most recent: '${previousMessages?.[0]?.content?.substring(0, 70)}...' Role: ${previousMessages?.[0]?.role}`);
    
    // Build context from previous messages
    const contextMessages = previousMessages ? 
      formatConversationContext(previousMessages.reverse()) : '';
    
    // Get AI response with context
    const rawAiResponse = await getAiResponse(
      conversationType,
      content,
      contextMessages,
      attachments
    );

    console.log('Raw AI response received:', rawAiResponse);

    // Process the AI response to extract clean content
    const aiResponseContent = createAIResponse(rawAiResponse);
    console.log('Processed AI response:', aiResponseContent);

    if (!aiResponseContent.generatedText || typeof aiResponseContent.generatedText !== 'string') {
      console.error('Invalid AI response: generatedText is missing or not a string. Full object:', aiResponseContent);
      throw new Error("Invalid AI response content");
    }
    
    // Insert AI response
    const { data: aiMessageData, error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponseContent.generatedText,
        source_urls: aiResponseContent.sourceUrls || [],
        attachments: []
      })
      .select('*, source_urls')
      .single();

    if (aiMessageError) {
      console.error('Error saving AI response:', aiMessageError);
      toast.error("Couldn't save AI response");
      throw aiMessageError;
    }
    
    console.log('AI response saved successfully');

    // Generate a title for the conversation if it's currently "New Conversation"
    if (conversationData.title === "New Conversation" && previousMessages && previousMessages.length >= 1) {
      try {
        const allMessages = [...previousMessages, { role: 'user', content }, { role: 'assistant', content: aiResponseContent.generatedText }];
        const generatedTitle = await aiProviderService.generateTitle(allMessages);
        
        if (generatedTitle && generatedTitle !== "New Conversation") {
          await supabase
            .from('conversations')
            .update({ 
              title: generatedTitle,
              updated_at: new Date().toISOString() 
            })
            .eq('id', conversationId);
          console.log('Conversation title updated to:', generatedTitle);
        } else {
          // Just update the timestamp
          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        }
      } catch (titleError) {
        console.error('Error generating title:', titleError);
        // Still update the timestamp even if title generation fails
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    } else {
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    const aiResponse: Message = {
      id: aiMessageData.id,
      conversation_id: aiMessageData.conversation_id,
      role: 'assistant',
      content: aiMessageData.content,
      created_at: aiMessageData.created_at,
      sourceUrls: aiMessageData.source_urls || []
    };

    return { aiResponse };
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error("Failed to get AI response");
    return null;
  }
};
