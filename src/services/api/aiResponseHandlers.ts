
import { supabase } from "@/integrations/supabase/client";
import { ConversationType } from "../types/conversationTypes";
import { aiProviderService } from "../ai/aiProviderService";
import { getChatPromptForType } from "../utils/conversationUtils";
import { extractUrlType, formatConversationContext } from "./conversationUtils";
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
): Promise<{ generatedText: string, sourceUrls: string[] }> => {
  let resultFromProvider: any; // To store result from aiProviderService
  try {
    console.log('Generating AI response for:', conversationType);
    
    // Get user profile context to enhance the response
    const userId = await getCurrentUserId();
    const profileContext = userId ? await getUserProfileContext(userId) : null;
    console.log('AI_DEBUG: Profile context being used for AI prompt:', JSON.stringify(profileContext, null, 2));
    
    // Create prompt based on conversation type and include context
    const prompt = getChatPromptForType(
      conversationType, 
      userMessage, 
      contextMessages,
      { 
        brief: true, 
        depth: 'low', 
        format: 'paragraph',
        // Add constraints for more concise responses
        maxLength: 300,
        focusedResponse: true 
      }
    );
    const enhancedPrompt = profileContext 
      ? `${profileContext}\n\nPlease provide a concise and focused response: ${prompt}` 
      : `Please provide a concise and focused response: ${prompt}`;
    
    // Get model options based on conversation type
    const options = {
      ...getModelOptions(conversationType),
      // Reduce max tokens for more concise responses
      maxTokens: 250,
      temperature: 0.2
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
      
      const systemPromptForFileAnalysis = `You are analyzing a file as part of an ongoing career advisory conversation. ${profileContext ? 'User profile context: ' + profileContext + '.' : ''} The user's message accompanying this file upload was: '${userMessage}'. Please provide analysis relevant to this context and the user's message.`;

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('perplexity-analyze-file', {
        body: {
          fileUrl: fileUrl,
          fileName: fileName,
          fileType: fileType,
          systemPrompt: systemPromptForFileAnalysis,
          maxTokens: options.maxTokens || 1500, // Ensure options.maxTokens is accessed correctly
          temperature: options.temperature || 0.35 // Ensure options.temperature is accessed correctly
        }
      });

      let textOutput;
      if (analysisError) {
        console.error('Error invoking perplexity-analyze-file function:', analysisError);
        textOutput = "Sorry, I encountered an error analyzing the file. Please try again.";
      } else if (analysisData.error) {
        console.error('perplexity-analyze-file function returned an error:', analysisData.error, analysisData.message);
        textOutput = analysisData.message || "Sorry, I couldn't analyze the file at this time.";
      } else if (!analysisData.analysis) {
        console.error('No analysis result was returned from perplexity-analyze-file for:', fileName);
        textOutput = "I wasn't able to get an analysis for the file. Please ensure it's a supported format and try again.";
      } else {
        textOutput = analysisData.analysis;
      }
      
      resultFromProvider = { 
        generatedText: textOutput, 
        sourceUrls: [] // File analysis itself usually doesn't cite external web sources.
      };
      console.log('File analysis via Supabase function complete');
    } 
    // Check for URLs in the message
    else if (containsUrl(userMessage)) {
      const url = extractFirstUrl(userMessage);
      if (url) {
        const urlType = extractUrlType(url);
        console.log('Analyzing URL:', url, 'Type:', urlType);
        resultFromProvider = await aiProviderService.analyzeUrl(
          url, urlType, profileContext || undefined
        );
        console.log('URL analysis complete');
      } else {
        // Fallback to text generation if URL extraction fails
        resultFromProvider = await aiProviderService.generateResponse(
          enhancedPrompt, conversationType, options
        );
      }
    } 
    // Standard text analysis
    else {
      console.log('Generating AI response using provider service');
      resultFromProvider = await aiProviderService.generateResponse(
        enhancedPrompt, conversationType, options
      );
      console.log('AI response generated successfully');
    }

    console.log('Result from aiProviderService in getAiResponse:', resultFromProvider);
    let aiResponseContent = { generatedText: '', sourceUrls: [] as string[] };

    if (typeof resultFromProvider === 'object' && resultFromProvider !== null && 
        typeof resultFromProvider.generatedText === 'string' && 
        Array.isArray(resultFromProvider.sourceUrls) &&
        resultFromProvider.sourceUrls.every((url: unknown) => typeof url === 'string')) {
      aiResponseContent.generatedText = resultFromProvider.generatedText;
      aiResponseContent.sourceUrls = resultFromProvider.sourceUrls;
    } else if (typeof resultFromProvider === 'string') {
      aiResponseContent.generatedText = resultFromProvider;
      // sourceUrls remains []
      console.warn('aiProviderService returned a string, packaging into standard object:', resultFromProvider);
    } else {
      console.error('Malformed or unexpected response structure from aiProviderService in getAiResponse:', resultFromProvider);
      aiResponseContent.generatedText = "Error: AI response was not in the expected format.";
      // sourceUrls remains []
    }
    
    return aiResponseContent;

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
