
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types/conversationTypes";
import { asConversationType } from "./conversationApiUtils";
import { aiProviderService } from "../ai/aiProviderService";
import { getChatPromptForType } from "../utils/conversationUtils";
import { formatConversationContext } from "./conversationApiUtils";

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
    
    // Parse conversation type
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
    
    // Build context from previous messages using the utility function
    const contextMessages = previousMessages ? 
      formatConversationContext(previousMessages.reverse()) : '';
    
    console.log('Context built with message count:', previousMessages?.length);
    
    // Create prompt based on conversation type and include context
    const prompt = getChatPromptForType(conversationType, content, contextMessages);
    
    let aiResponseContent = '';
    
    // Handle file attachments if present
    if (attachments && attachments.length > 0) {
      console.log('Processing attachments:', attachments);
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
        // Analyze file with our provider service
        aiResponseContent = await aiProviderService.analyzeFile(fileUrl, fileName, fileType);
        console.log('File analysis complete');
      } catch (fileError) {
        console.error('Error analyzing file:', fileError);
        aiResponseContent = `I couldn't analyze the file you provided. ${fileError.message || 'Please try again with a different file or format.'}`;
      }
    } else {
      // Generate AI response based on text prompt using our provider service
      console.log('Generating AI response using provider service');
      aiResponseContent = await aiProviderService.generateResponse(prompt, conversationType);
      console.log('AI response generated successfully');
    }
    
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
