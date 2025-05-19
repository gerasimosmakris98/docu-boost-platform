
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types/conversationTypes";
import { asConversationType } from "./conversationApiUtils";
import { aiProviderService } from "../ai/aiProviderService";
import { 
  getChatPromptForType, 
  formatConversationContext, 
  extractUrlType
} from "../utils/conversationUtils";
import { getModelOptions } from "../ai/providerConfigs";
import { getProfileDataForAdvisor } from "./profileUtils";

/**
 * Extract URLs from a message
 */
const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

/**
 * Determine if message is brief or requires detailed response
 * based on content and length
 */
const shouldBeBrief = (message: string): boolean => {
  // Messages with these keywords likely want brief responses
  const briefKeywords = ['help', 'tip', 'quick', 'start', 'hello', 'hi'];
  
  const lowerMessage = message.toLowerCase();
  
  // If message is short (less than 15 words)
  if (message.split(' ').length < 15) {
    // Check if it contains any brief keywords
    return briefKeywords.some(keyword => lowerMessage.includes(keyword));
  }
  
  // Longer messages typically need more detailed responses
  return false;
};

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
    const userId = conversationData.user_id;
    
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
    
    // Get previous messages to provide context (limit to 5 for more focused context)
    const { data: previousMessages, error: prevMsgError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (prevMsgError) throw prevMsgError;
    
    // Build context from previous messages using the utility function
    const contextMessages = previousMessages ? 
      formatConversationContext(previousMessages.reverse()) : '';
    
    console.log('Context built with message count:', previousMessages?.length);
    
    // Get profile data for this advisor type to enhance context
    const profileContext = await getProfileDataForAdvisor(userId, conversationType);
    console.log('Profile context retrieved for advisor type:', conversationType);
    
    // Determine if response should be brief based on message content
    const brief = shouldBeBrief(content);
    console.log('Response should be brief:', brief);
    
    // Extract any URLs from the message for analysis
    const urls = extractUrls(content);
    const hasUrls = urls.length > 0;
    console.log('URLs detected:', urls.length);
    
    // Get model options based on conversation type
    const modelOptions = getModelOptions(conversationType);
    
    // Add required properties for ProgressiveResponseOptions
    const options = {
      ...modelOptions,
      brief: brief,
      depth: brief ? 'low' : 'medium' as 'low' | 'medium' | 'high'
    };
    
    console.log('Using model options:', options);
    
    // Create prompt based on conversation type and include context and profile data
    let prompt = getChatPromptForType(
      conversationType, 
      content, 
      contextMessages, 
      { brief, depth: brief ? 'low' : 'medium' }
    );
    
    // Add profile context to prompt if available
    if (profileContext) {
      prompt = `${profileContext}\n\n${prompt}`;
    }
    
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
        aiResponseContent = await aiProviderService.analyzeFile(
          fileUrl, 
          fileName, 
          fileType,
          profileContext // Pass profile context for better file analysis
        );
        console.log('File analysis complete');
      } catch (fileError) {
        console.error('Error analyzing file:', fileError);
        aiResponseContent = `I couldn't analyze the file you provided. ${fileError.message || 'Please try again with a different file or format.'}`;
      }
    } else if (hasUrls) {
      // If there are URLs in the message, analyze the first one
      const urlToAnalyze = urls[0];
      const urlType = extractUrlType(urlToAnalyze);
      
      console.log('Analyzing URL:', urlToAnalyze, 'Type:', urlType);
      
      try {
        // Use the URL analysis method
        aiResponseContent = await aiProviderService.analyzeUrl(urlToAnalyze, urlType, profileContext);
        console.log('URL analysis complete');
      } catch (urlError) {
        console.error('Error analyzing URL:', urlError);
        // Fall back to regular text generation
        aiResponseContent = await aiProviderService.generateResponse(
          prompt, 
          conversationType,
          options
        );
      }
    } else {
      // Generate AI response based on text prompt using our provider service
      console.log('Generating AI response using provider service');
      aiResponseContent = await aiProviderService.generateResponse(
        prompt, 
        conversationType,
        options
      );
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
