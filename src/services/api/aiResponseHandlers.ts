
import { supabase } from "@/integrations/supabase/client";
import { ConversationType } from "../types/conversationTypes";
import { aiProviderService } from "../ai/aiProviderService";
import { getChatPromptForType } from "./conversationUtils";
import { extractUrlType, formatConversationContext } from "./conversationUtils";
import { getUserProfileContext } from "./profileUtils";
import { getModelOptions } from "../ai/providerConfigs";
import { AIResponseResult } from "../ai/types";

/**
 * Get an AI response with fallback handling
 */
export const getAiResponse = async (
  conversationType: ConversationType,
  userMessage: string,
  contextMessages: string,
  attachments: string[] = []
): Promise<AIResponseResult> => {
  try {
    console.log('Generating AI response for:', conversationType);
    
    // Get user profile context to enhance the response
    const userId = await getCurrentUserId();
    const profileContext = userId ? await getUserProfileContext(userId) : null;
    
    // Create prompt based on conversation type and include context
    const prompt = getChatPromptForType(
      conversationType, 
      userMessage, 
      contextMessages,
      { 
        brief: true, 
        depth: 'low', 
        format: 'mixed',
        // Add constraints for more conversational responses
        maxLength: 350,
        focusedResponse: true,
        conversational: true
      }
    );
    
    // Add instruction to treat each conversation separately
    const enhancedPrompt = profileContext 
      ? `${profileContext}\n\nPlease provide a focused response treating this as a new conversation. Format with short paragraphs and appropriate spacing: ${prompt}` 
      : `Please provide a focused response treating this as a new conversation. Format with short paragraphs and appropriate spacing: ${prompt}`;
    
    // Get model options based on conversation type
    const options = {
      ...getModelOptions(conversationType),
      // Adjust token settings for better responses
      maxTokens: 300,
      temperature: 0.3
    };
        
    // Handle file attachments if present
    if (attachments && attachments.length > 0) {
      console.log('Processing attachments:', attachments);
      const fileUrl = attachments[0];
      const fileName = fileUrl.split('/').pop() || 'file';
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      let fileType = 'application/octet-stream'; // Default
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        fileType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      } else if (fileExtension === 'pdf') {
        fileType = 'application/pdf';
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileType = 'application/msword';
      }
      
    // Check for URLs in the message
    else if (containsUrl(userMessage)) {
      const url = extractFirstUrl(userMessage);
      if (url) {
        const urlType = extractUrlType(url);
        console.log('Analyzing URL:', url, 'Type:', urlType);
        
        // Enhanced URL analysis prompt
        const urlAnalysisPrompt = `
          Analyze this ${urlType} URL as a new conversation.
          Format your response with:
          - Short paragraphs with good spacing
          - Bullet points for key takeaways
          - Numbered lists for steps or recommendations
          
          Be conversational and human-like.
        `;
        
        return await aiProviderService.analyzeUrl(
          url, urlType, urlAnalysisPrompt
        );
      } else {
        // Fallback to text generation if URL extraction fails
        return await aiProviderService.generateResponse(
          enhancedPrompt, conversationType, options
        );
      }
    } 
    // Standard text analysis
    else {
      console.log('Generating AI response using provider service');
      return await aiProviderService.generateResponse(
        enhancedPrompt, conversationType, options
      );
    }
  } catch (error) {
    console.error('Error in getAiResponse:', error);
    // Ensure the catch block also returns the new object structure
    return { 
      generatedText: "I apologize, but I encountered an error while processing your request. Please try again.", 
      sourceUrls: [] 
    };
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
