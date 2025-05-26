
import { AIModelOptions, ProgressiveResponseOptions, ConversationType, StructuredResponse } from './types';
import { supabase } from '@/integrations/supabase/client';
import { getSystemPrompt } from '@/services/utils/conversationUtils';

// Streamlined AI provider service with consistent response handling
const aiProviderService = {
  // Generate a simple text response
  generateResponse: async (
    prompt: string, 
    conversationType: ConversationType,
    options?: AIModelOptions & ProgressiveResponseOptions
  ): Promise<string> => {
    const functionName = 'generateResponse';
    const supabaseFunctionName = 'perplexity-ai-response';
    const fallbackMessage = "I'm having trouble responding right now. Could you try rephrasing your question?";
    console.log(`AI Provider (${functionName}): Generating response for conversation type: ${conversationType}`);
    
    try {
      const systemPromptForType = getSystemPrompt(conversationType);
      const enhancedPrompt = `
        ${systemPromptForType}
        
        Guidelines:
        - Be conversational and helpful (max 2-3 paragraphs)
        - Only respond directly to what was asked
        - Use a friendly, supportive tone
        - Avoid introductions or conclusions
        
        User message: ${prompt}
      `;
      
      const { data, error } = await supabase.functions.invoke(supabaseFunctionName, {
        body: { 
          prompt: enhancedPrompt,
          type: conversationType,
          maxTokens: options?.maxTokens || 200,
          brief: options?.brief || true
        }
      });
      
      if (error) {
        console.error(`AI Provider (${functionName}): Error invoking Supabase function '${supabaseFunctionName}':`, error);
        throw new Error("Supabase invocation failed");
      }
      
      if (data.error) {
        console.error(`AI Provider (${functionName}): Supabase function '${supabaseFunctionName}' returned error:`, data.error, data.message);
        throw new Error("Supabase function execution error");
      }
      
      if (!data.generatedText || typeof data.generatedText !== 'string' || data.generatedText.trim() === '') {
        console.error(`AI Provider (${functionName}): Invalid or missing generatedText from Supabase function '${supabaseFunctionName}'. Received:`, data.generatedText);
        throw new Error("Invalid generatedText");
      }
      
      console.log(`AI Provider (${functionName}): Successfully received response.`);
      return data.generatedText;
    } catch (error: any) {
      console.error(`AI Provider (${functionName}): Unhandled error - ${error.message}`, error);
      return fallbackMessage;
    }
  },
  
  // Generate a structured response with citations
  generateStructuredResponse: async (
    prompt: string, 
    conversationType: ConversationType,
    options?: AIModelOptions & ProgressiveResponseOptions
  ): Promise<StructuredResponse> => {
    const functionName = 'generateStructuredResponse';
    const supabaseFunctionName = 'perplexity-ai-response';
    const fallbackResponse: StructuredResponse = { 
      generatedText: "I'm having trouble responding right now. Could you try rephrasing your question?", 
      sourceUrls: [] 
    };
    console.log(`AI Provider (${functionName}): Generating structured response for conversation type: ${conversationType}`);
    
    try {
      const systemPromptForType = getSystemPrompt(conversationType);
      const enhancedPrompt = `
        ${systemPromptForType}
        
        Guidelines:
        - Be conversational and helpful (max 2-3 paragraphs)
        - If using sources, cite them as [1], [2], etc.
        - Respond in JSON format: {"generatedText": "your response with [1] citations", "sourceUrls": ["url1", "url2"]}
        - If no citations, use empty array for sourceUrls
        
        User message: ${prompt}
      `;
      
      const { data, error } = await supabase.functions.invoke(supabaseFunctionName, {
        body: { 
          prompt: enhancedPrompt,
          type: conversationType,
          maxTokens: options?.maxTokens || 200,
          brief: options?.brief || true
        }
      });
      
      if (error) {
        console.error(`AI Provider (${functionName}): Error invoking Supabase function '${supabaseFunctionName}':`, error);
        throw new Error("Supabase invocation failed");
      }
      
      if (data.error) {
        console.error(`AI Provider (${functionName}): Supabase function '${supabaseFunctionName}' returned error:`, data.error, data.message);
        throw new Error("Supabase function execution error");
      }
      
      if (!data.generatedText || typeof data.generatedText !== 'string') { // Check if string before parsing
        console.error(`AI Provider (${functionName}): Invalid or missing generatedText (expected JSON string) from Supabase function '${supabaseFunctionName}'. Received:`, data.generatedText);
        throw new Error("Invalid generatedText (expected JSON string)");
      }
      
      let parsedResponse: any;
      let responseGeneratedText = '';
      let responseSourceUrls: string[] = [];

      try {
        parsedResponse = JSON.parse(data.generatedText);
        
        if (typeof parsedResponse.generatedText === 'string' && parsedResponse.generatedText.trim() !== '') {
          responseGeneratedText = parsedResponse.generatedText;
        } else {
          console.warn(`AI Provider (${functionName}): Parsed generatedText is invalid or empty. Using fallback. Received:`, parsedResponse.generatedText);
          responseGeneratedText = fallbackResponse.generatedText;
        }

        if (Array.isArray(parsedResponse.sourceUrls)) {
          responseSourceUrls = parsedResponse.sourceUrls;
        } else {
          console.warn(`AI Provider (${functionName}): Parsed sourceUrls is not an array. Defaulting to empty array. Received:`, parsedResponse.sourceUrls);
          responseSourceUrls = [];
        }
      } catch (parseError) {
        console.warn(`AI Provider (${functionName}): Response not in valid JSON format, treating raw generatedText as plain text. Parse error:`, parseError, 'Received:', data.generatedText);
        // Use raw data.generatedText if it's a non-empty string, otherwise fallback
        if (data.generatedText.trim() !== '') {
          responseGeneratedText = data.generatedText;
        } else {
          console.error(`AI Provider (${functionName}): Raw generatedText (fallback from parse error) is empty. Using error message.`);
          responseGeneratedText = fallbackResponse.generatedText;
        }
        responseSourceUrls = []; // Reset sourceUrls as structure is unknown
      }
      
      console.log(`AI Provider (${functionName}): Successfully processed response.`);
      return { 
        generatedText: responseGeneratedText, 
        sourceUrls: responseSourceUrls
      };
    } catch (error: any) {
      console.error(`AI Provider (${functionName}): Unhandled error - ${error.message}`, error);
      return fallbackResponse;
    }
  },
  
  // Analyze a file
  analyzeFile: async (
    fileUrl: string,
    fileName: string,
    fileType: string,
    systemPrompt?: string,
    options?: AIModelOptions
  ): Promise<string> => {
    const functionName = 'analyzeFile';
    const supabaseFunctionName = 'perplexity-ai-response';
    const fallbackMessage = "I couldn't analyze your file in detail right now. Please try again in a moment.";
    console.log(`AI Provider (${functionName}): Analyzing file: ${fileName}, Type: ${fileType}`);
    
    try {
      const analysisPrompt = systemPrompt || `
        Analyze this ${fileType} file: ${fileName}
        
        Guidelines:
        - Provide specific, actionable feedback
        - Highlight 2-3 key strengths
        - Suggest 2-3 specific improvements
        - Be conversational and supportive
      `;
      
      const { data, error } = await supabase.functions.invoke(supabaseFunctionName, {
        body: { 
          prompt: analysisPrompt,
          type: 'file_analysis',
          maxTokens: options?.maxTokens || 300
        }
      });
      
      if (error) {
        console.error(`AI Provider (${functionName}): Error invoking Supabase function '${supabaseFunctionName}':`, error);
        throw new Error("Supabase invocation failed");
      }
      
      if (data.error) {
        console.error(`AI Provider (${functionName}): Supabase function '${supabaseFunctionName}' returned error:`, data.error, data.message);
        throw new Error("Supabase function execution error");
      }
      
      if (!data.generatedText || typeof data.generatedText !== 'string' || data.generatedText.trim() === '') {
        console.error(`AI Provider (${functionName}): Invalid or missing generatedText from Supabase function '${supabaseFunctionName}'. Received:`, data.generatedText);
        throw new Error("Invalid generatedText");
      }
      
      console.log(`AI Provider (${functionName}): Successfully received analysis.`);
      return data.generatedText;
    } catch (error: any) {
      console.error(`AI Provider (${functionName}): Unhandled error - ${error.message}`, error);
      return fallbackMessage;
    }
  },
  
  // Analyze a URL
  analyzeUrl: async (
    url: string, 
    type: string, 
    profileContext?: string
  ): Promise<string> => {
    const functionName = 'analyzeUrl';
    const supabaseFunctionName = 'perplexity-ai-response';
    const specificFallbackMessage = "I tried to analyze the URL, but couldn't access the content. This can happen if the website blocks automated access or requires login. You could try summarizing the key points from the URL and asking me about those.";
    const genericFallbackMessage = "I couldn't analyze that URL right now. Would you like to try again?";
    console.log(`AI Provider (${functionName}): Analyzing URL: ${url}, Type: ${type}`);
    
    try {
      const urlAnalysisPrompt = `
        Analyze this ${type} URL: ${url}
        
        ${profileContext ? `Context: ${profileContext}` : ''}
        
        Guidelines:
        - Provide 2-3 key takeaways
        - Give specific, actionable advice
        - Be conversational and helpful
      `;
      
      const { data, error } = await supabase.functions.invoke(supabaseFunctionName, {
        body: { 
          prompt: urlAnalysisPrompt,
          type: 'url_analysis',
          maxTokens: 250
        }
      });
      
      if (error) {
        console.error(`AI Provider (${functionName}): Error invoking Supabase function '${supabaseFunctionName}':`, error);
        throw new Error("Supabase invocation failed"); // Caught by main try-catch, returns genericFallbackMessage
      }
      
      if (data.error) {
        console.error(`AI Provider (${functionName}): Supabase function '${supabaseFunctionName}' returned error:`, data.error, data.message);
        throw new Error("Supabase function execution error"); // Caught by main try-catch, returns genericFallbackMessage
      }
      
      if (!data.generatedText || typeof data.generatedText !== 'string' || data.generatedText.trim() === '') {
        console.error(`AI Provider (${functionName}): Invalid or missing generatedText from Supabase function '${supabaseFunctionName}'. Received:`, data.generatedText);
        // For this specific case, if AI returns empty/invalid, it might be similar to a failure pattern.
        return specificFallbackMessage;
      }

      // Check for failure patterns
      const failurePatterns = [
        "i cannot access this url", "i can't access that link", "i am unable to access external websites",
        "could not retrieve content", "unable to fetch", "failed to retrieve the webpage",
        "error in accessing the url", "unable to load the url"
      ];
      const lowercaseText = data.generatedText.toLowerCase();
      const hasFailurePattern = failurePatterns.some(pattern => lowercaseText.includes(pattern));
      
      if (hasFailurePattern || data.generatedText.length < 50) { // Increased length check for more robustness
        console.warn(`AI Provider (${functionName}): Detected failure pattern or short response in URL analysis. Response:`, data.generatedText);
        return specificFallbackMessage;
      }
      
      console.log(`AI Provider (${functionName}): Successfully received analysis.`);
      return data.generatedText;
    } catch (error: any) { // This catch will handle errors thrown from invoke/data.error/etc.
      console.error(`AI Provider (${functionName}): Unhandled error - ${error.message}`, error);
      return genericFallbackMessage; // Generic fallback for unexpected errors
    }
  },
  
  // Generate conversation title
  generateTitle: async (
    messages: {role: string, content: string}[]
  ): Promise<string> => {
    const functionName = 'generateTitle';
    const supabaseFunctionName = 'perplexity-ai-response';
    const fallbackTitle = "New Conversation";

    if (!messages || messages.length === 0) {
      console.log(`AI Provider (${functionName}): No messages provided, returning default title.`);
      return fallbackTitle;
    }
    
    try {
      const messageContext = messages
        .filter(msg => msg.role === 'user' && msg.content && msg.content.trim() !== '')
        .slice(0, 2) // Use first two user messages
        .map(msg => msg.content.trim())
        .join('\n');
        
      if (!messageContext) {
        console.log(`AI Provider (${functionName}): No valid user message content for title generation, returning default title.`);
        return fallbackTitle;
      }
      
      const titlePrompt = `
        Generate a short title (3-5 words max) for a conversation starting with:
        "${messageContext.substring(0, 150)}${messageContext.length > 150 ? '...' : ''}"
        
        Return ONLY the title, no quotes or "Title: " prefix.
      `;
      
      const { data, error } = await supabase.functions.invoke(supabaseFunctionName, {
        body: { 
          prompt: titlePrompt,
          type: 'conversation_title', // Ensure this type is handled by the Supabase function
          maxTokens: 15 // Reduced for very short titles
        }
      });
      
      if (error) {
        console.error(`AI Provider (${functionName}): Error invoking Supabase function '${supabaseFunctionName}':`, error);
        return fallbackTitle; // Directly return fallback on error
      }
      
      if (data.error) {
        console.error(`AI Provider (${functionName}): Supabase function '${supabaseFunctionName}' returned error:`, data.error, data.message);
        return fallbackTitle; // Directly return fallback on error
      }
      
      if (!data.generatedText || typeof data.generatedText !== 'string' || data.generatedText.trim() === '') {
        console.warn(`AI Provider (${functionName}): Invalid or missing generatedText from Supabase function '${supabaseFunctionName}'. Received:`, data.generatedText);
        return fallbackTitle; // Directly return fallback
      }
      
      // Cleanup the title
      const title = data.generatedText
        .replace(/^["'\s]+|["'\s]+$/g, '') // Remove leading/trailing quotes and spaces
        .replace(/^(Title|Conversation Title):\s*/i, '') // Remove "Title: " or "Conversation Title: " prefix
        .trim(); // Final trim
        
      if (title === '') {
        console.warn(`AI Provider (${functionName}): Title became empty after cleanup. Original:`, data.generatedText);
        return fallbackTitle;
      }
      
      console.log(`AI Provider (${functionName}): Successfully generated title: "${title}"`);
      return title;
    } catch (error: any) {
      console.error(`AI Provider (${functionName}): Unhandled error - ${error.message}`, error);
      return fallbackTitle; // Fallback for any other errors
    }
  },
  
  // Reset providers
  resetProviders: () => {
    console.log('Resetting AI providers');
  }
};

export { aiProviderService };
