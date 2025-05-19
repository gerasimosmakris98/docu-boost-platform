
import { supabase } from "@/integrations/supabase/client";
import { ConversationType } from "../types/conversationTypes";
import { aiProviderService } from "../ai/aiProviderService";
import { getChatPromptForType } from "../utils/conversationUtils";
import { extractUrlType } from "./conversationUtils";
import { getUserProfileContext } from "./profileUtils";
import { getModelOptions } from "../ai/providerConfigs";

/**
 * Get an AI response with fallback handling
 */
export const getAiResponse = async (
  conversationType: ConversationType,
  userMessage: string,
  contextMessages: string,
  attachments: string[] = []
): Promise<string> => {
  try {
    console.log('Generating AI response for:', conversationType);
    
    // Get user profile context to enhance the response
    const userId = await getCurrentUserId();
    const profileContext = userId ? await getUserProfileContext(userId) : null;
    
    // Create prompt based on conversation type and include context
    const prompt = getChatPromptForType(conversationType, userMessage, contextMessages);
    const enhancedPrompt = profileContext 
      ? `${profileContext}\n\n${prompt}` 
      : prompt;
    
    // Get model options based on conversation type
    const options = getModelOptions(conversationType);
    
    let aiResponseContent = '';
    
    // Handle file attachments if present
    if (attachments && attachments.length > 0) {
      console.log('Processing attachments:', attachments);
      // Analyze the first attachment
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
      
      // Analyze file using AI provider service
      aiResponseContent = await aiProviderService.analyzeFile(
        fileUrl, 
        fileName, 
        fileType,
        profileContext || undefined
      );
      console.log('File analysis complete');
    } 
    // Check for URLs in the message
    else if (containsUrl(userMessage)) {
      // Extract the first URL from the message
      const url = extractFirstUrl(userMessage);
      if (url) {
        const urlType = extractUrlType(url);
        console.log('Analyzing URL:', url, 'Type:', urlType);
        
        // Analyze URL using AI provider service
        aiResponseContent = await aiProviderService.analyzeUrl(
          url, 
          urlType, 
          profileContext || undefined
        );
        console.log('URL analysis complete');
      } else {
        // Fallback to text generation if URL extraction fails
        aiResponseContent = await aiProviderService.generateResponse(
          enhancedPrompt, 
          conversationType,
          options
        );
      }
    } 
    // Standard text analysis
    else {
      // Generate AI response based on text prompt
      console.log('Generating AI response using provider service');
      aiResponseContent = await aiProviderService.generateResponse(
        enhancedPrompt, 
        conversationType,
        options
      );
      console.log('AI response generated successfully');
    }
    
    return aiResponseContent;
  } catch (error) {
    console.error('Error in getAiResponse:', error);
    return "I apologize, but I encountered an error while processing your request. Please try again later.";
  }
};

/**
 * Check if a string contains a URL
 */
const containsUrl = (text: string): boolean => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
};

/**
 * Extract the first URL from a string
 */
const extractFirstUrl = (text: string): string | null => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches[0] : null;
};

/**
 * Get the current user ID
 */
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
