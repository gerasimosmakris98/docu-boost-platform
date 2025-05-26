
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

// Extract URLs from a message
const extractUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

// Determine if message should be brief
const shouldBeBrief = (message: string): boolean => {
  const briefKeywords = ['help', 'tip', 'quick', 'start', 'hello', 'hi'];
  const lowerMessage = message.toLowerCase();
  
  if (message.split(' ').length < 15) {
    return briefKeywords.some(keyword => lowerMessage.includes(keyword));
  }
  
  return false;
};

// Send a message and get AI response
export const sendMessage = async (
  conversationId: string, 
  content: string,
  attachments: string[] = []
): Promise<{ aiResponse: Message } | null> => {
  try {
    // Get conversation data
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (convError) throw convError;
    
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
    
    // Get previous messages for context
    const { data: previousMessages, error: prevMsgError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (prevMsgError) throw prevMsgError;
    
    const contextMessages = previousMessages ? 
      formatConversationContext(previousMessages.reverse()) : '';
    
    console.log('Context built with message count:', previousMessages?.length);
    
    // Get profile context
    const profileContext = await getProfileDataForAdvisor(userId, conversationType);
    console.log('Profile context retrieved for advisor type:', conversationType);
    
    const brief = shouldBeBrief(content);
    console.log('Response should be brief:', brief);
    
    const urls = extractUrls(content);
    const hasUrls = urls.length > 0;
    console.log('URLs detected:', urls.length);
    
    const modelOptions = getModelOptions(conversationType);
    
    const options = {
      ...modelOptions,
      brief: brief,
      depth: brief ? 'low' : 'medium' as 'low' | 'medium' | 'high'
    };
    
    console.log('Using model options:', options);
    
    let prompt = getChatPromptForType(
      conversationType, 
      content, 
      contextMessages, 
      { brief, depth: brief ? 'low' : 'medium' }
    );
    
    if (profileContext) {
      prompt = `${profileContext}\n\n${prompt}`;
    }
    
    let aiResponseContent = '';
    let sourceUrls: string[] = [];
    
    // Handle file attachments
    if (attachments && attachments.length > 0) {
      console.log('Processing attachments:', attachments);
      const fileUrl = attachments[0];
      const fileName = fileUrl.split('/').pop() || 'file';
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
        aiResponseContent = await aiProviderService.analyzeFile(
          fileUrl, 
          fileName, 
          fileType,
          profileContext
        );
        console.log('File analysis complete');
      } catch (fileError) {
        console.error('Error analyzing file:', fileError);
        aiResponseContent = `I couldn't analyze the file you provided. Please try again with a different file or format.`;
      }
    } else if (hasUrls) {
      // Handle URL analysis
      const urlToAnalyze = urls[0];
      const urlType = extractUrlType(urlToAnalyze);
      
      console.log('Analyzing URL:', urlToAnalyze, 'Type:', urlType);
      
      try {
        aiResponseContent = await aiProviderService.analyzeUrl(urlToAnalyze, urlType, profileContext);
        console.log('URL analysis complete');
      } catch (urlError) {
        console.error('Error analyzing URL:', urlError);
        aiResponseContent = await aiProviderService.generateResponse(
          prompt, 
          conversationType,
          options
        );
      }
    } else {
      // Generate regular AI response
      console.log('Generating AI response using provider service');
      const structuredResponse = await aiProviderService.generateStructuredResponse(
        prompt, 
        conversationType,
        options
      );
      aiResponseContent = structuredResponse.generatedText;
      sourceUrls = structuredResponse.sourceUrls;
      console.log('AI response generated successfully');
    }
    
    // Insert AI response
    const { data: aiMessageData, error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponseContent,
        source_urls: sourceUrls,
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
      sourceUrls: aiMessageData.source_urls || [],
      created_at: aiMessageData.created_at
    };

    return { aiResponse };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};
