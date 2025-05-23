
import { AIModelOptions, ProgressiveResponseOptions, ConversationType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced version of the AI provider service with more conversational responses
const aiProviderService = {
  // Generate a response using the AI provider
  generateResponse: async (
    prompt: string, 
    conversationType: ConversationType,
    options?: AIModelOptions & ProgressiveResponseOptions
  ): Promise<{ generatedText: string, sourceUrls: string[] }> => {
    console.log('Generating response for:', conversationType);
    
    try {
      // Create a more conversational prompt that encourages brief, natural responses with citations
      const enhancedPrompt = `
        You are a friendly AI career advisor having a concise conversation. 
        
        Guidelines:
        - Be extremely brief and conversational (max 2-3 short paragraphs)
        - Use bullet points for lists or steps
        - Only respond directly to what was asked
        - Use a friendly, supportive tone
        - If referring to sources, use numbered citations like [1], [2]
        - Personalize based on any context about the user's background
        - Avoid introductions or conclusions
        - Use short paragraphs with line breaks
        - Respond like you're texting a friend
        - Format for readability with spacing between paragraphs
        
        User message: ${prompt}

        IMPORTANT: When you provide citations like [1], [2], please ensure your response is a JSON object with two keys: 'generatedText' for your textual answer with the citation markers, and 'sourceUrls' for an array of the corresponding source URL strings in the order of citation. For example: {"generatedText": "Text with [1] and [2]...", "sourceUrls": ["http://url1.com", "http://url2.com"]}. If no citations are used, respond with the same JSON structure, where 'sourceUrls' is an empty array.
      `;
      
      // Call Supabase Edge Function to generate AI response
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: enhancedPrompt,
          type: conversationType,
          maxTokens: 300, // Increased token count for better formatting
          brief: true
        }
      });
      
      if (error) {
        console.error('Error calling AI function:', error);
        throw new Error(`Failed to generate AI response: ${error.message}`);
      }
      
      if (data.error) {
        console.error('AI service error:', data.error);
        throw new Error(data.message || 'AI service error');
      }
      
      if (!data.generatedText) {
        throw new Error('No response received from AI service');
      }
      
      // Ensure proper formatting with line breaks
      let formattedText = data.generatedText;
      
      // Add proper line breaks if they're missing
      if (!formattedText.includes('\n\n') && formattedText.length > 150) {
        // Try to add line breaks after sentences for readability
        formattedText = formattedText.replace(/\.\s+/g, '.\n\n');
      }
      
      return {
        generatedText: formattedText,
        sourceUrls: data.sourceUrls || []
      };
    } catch (error) {
      console.error('Error in generateResponse:', error);
      
      // Provide a brief, helpful fallback response
      return {
        generatedText: `I'm having trouble responding right now. Let me know if you'd like some quick tips while I recover.`,
        sourceUrls: []
      };
    }
  },
  
  // Analyze a file using the AI provider
  analyzeFile: async (
    fileUrl: string,
    fileName: string,
    fileType: string,
    profileContext?: string,
    options?: AIModelOptions
  ): Promise<{ generatedText: string, sourceUrls: string[] }> => {
    console.log('Analyzing file:', fileName, fileType);
    
    try {
      // Create concise file analysis prompt
      const fileAnalysisPrompt = `
        Analyze this ${fileType} file: ${fileName}
        
        ${profileContext ? `Context: ${profileContext}` : ''}
        
        Guidelines:
        - Keep your response brief and focused
        - Highlight 2-3 key strengths
        - Suggest 2-3 specific improvements
        - Be conversational and supportive
        - Use bullet points for key points
        - Add space between paragraphs
        - If referring to specific parts, use numbered citations [1], [2]

        IMPORTANT: When you provide citations like [1], [2], please ensure your response is a JSON object with two keys: 'generatedText' for your textual answer with the citation markers, and 'sourceUrls' for an array of the corresponding source URL strings in the order of citation. For example: {"generatedText": "Text with [1] and [2]...", "sourceUrls": ["http://url1.com", "http://url2.com"]}. If no citations are used, respond with the same JSON structure, where 'sourceUrls' is an empty array.
      `;
      
      // Call Supabase Edge Function to analyze file
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: fileAnalysisPrompt,
          type: 'file_analysis',
          maxTokens: 300
        }
      });
      
      if (error) {
        console.error('Error calling AI function for file analysis:', error);
        throw new Error(`Failed to analyze file: ${error.message}`);
      }
      
      if (data.error) {
        console.error('AI service error for file analysis:', data.error);
        throw new Error(data.message || 'AI service error');
      }
      
      if (!data.generatedText) {
        throw new Error('No analysis received from AI service');
      }
      
      return {
        generatedText: data.generatedText,
        sourceUrls: data.sourceUrls || []
      };
    } catch (error) {
      console.error('Error in analyzeFile:', error);
      
      // Provide a brief fallback response for file analysis
      return {
        generatedText: `I couldn't analyze your file in detail right now. Would you like to try again in a moment?`,
        sourceUrls: []
      };
    }
  },
  
  // Analyze a URL using the AI provider
  analyzeUrl: async (
    url: string, 
    type: string, 
    profileContext?: string
  ): Promise<{ generatedText: string, sourceUrls: string[] }> => {
    console.log('Analyzing URL:', url, type);
    
    try {
      // Create concise URL analysis prompt
      const urlAnalysisPrompt = `
        Analyze this ${type} URL: ${url}
        
        ${profileContext ? `Context: ${profileContext}` : ''}
        
        Guidelines:
        - Keep your response conversational and brief
        - Focus on 2-3 key takeaways
        - Give specific, actionable advice
        - Be supportive and helpful
        - Use bullet points for key points
        - Add space between paragraphs
        - If referring to specific parts, use numbered citations [1], [2]

        IMPORTANT: When you provide citations like [1], [2], please ensure your response is a JSON object with two keys: 'generatedText' for your textual answer with the citation markers, and 'sourceUrls' for an array of the corresponding source URL strings in the order of citation. For example: {"generatedText": "Text with [1] and [2]...", "sourceUrls": ["http://url1.com", "http://url2.com"]}. If no citations are used, respond with the same JSON structure, where 'sourceUrls' is an empty array.
      `;
      
      // Call Supabase Edge Function to analyze URL
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: urlAnalysisPrompt,
          type: 'url_analysis',
          maxTokens: 300
        }
      });
      
      if (error) {
        console.error('Error calling AI function for URL analysis:', error);
        throw new Error(`Failed to analyze URL: ${error.message}`);
      }
      
      if (data.error) {
        console.error('AI service error for URL analysis:', data.error);
        throw new Error(data.message || 'AI service error');
      }
      
      if (!data.generatedText) {
        throw new Error('No analysis received from AI service');
      }

      // Define failure patterns for URL analysis
      const failurePatterns = [
        "i cannot access this url",
        "i can't access that link",
        "i am unable to access external websites",
        "please provide content from the url",
        "could not retrieve content",
        "unable to fetch",
        "failed to load",
        "error processing the url",
        "i do not have the capability to access external urls",
        "i'm sorry, but i cannot directly access external urls",
        "i am unable to directly access the content of urls"
      ];

      const genericErrorMessage = "I tried to analyze the URL, but I couldn't get specific information from it. This can happen if the website blocks automated access, requires a login, or if the content isn't in a format I can easily read. You could try summarizing the key points from the URL yourself and asking me about those.";

      if (typeof data.generatedText === 'string') {
        const lowercasedText = data.generatedText.toLowerCase();
        
        // Check for explicit failure patterns
        for (const pattern of failurePatterns) {
          if (lowercasedText.includes(pattern)) {
            console.warn("Perplexity returned vague/error for URL:", data.generatedText);
            return { 
              generatedText: genericErrorMessage,
              sourceUrls: [url]
            };
          }
        }
        
        // Check for very short responses (e.g., less than 30 characters)
        if (data.generatedText.length < 30) {
           if (lowercasedText.includes("unable") || lowercasedText.includes("cannot") || lowercasedText.includes("can't")) {
             console.warn("Perplexity returned very short and potentially unhelpful response for URL:", data.generatedText);
             return { 
               generatedText: genericErrorMessage,
               sourceUrls: [url]
             };
           }
        }
      }
      
      return {
        generatedText: data.generatedText,
        sourceUrls: data.sourceUrls || [url]
      };
    } catch (error) {
      console.error('Error in analyzeUrl:', error);
      
      // Provide a brief fallback response for URL analysis
      return {
        generatedText: `I couldn't analyze that URL in detail. Would you like me to try again?`,
        sourceUrls: [url]
      };
    }
  },
  
  // Generate title for a conversation based on its messages
  generateTitle: async (
    messages: {role: string, content: string}[]
  ): Promise<string> => {
    if (messages.length === 0) return "New Conversation";
    
    try {
      // Extract first few user messages for context
      const messageContext = messages
        .filter(msg => msg.role === 'user')
        .slice(0, 2)
        .map(msg => msg.content)
        .join('\n');
        
      if (!messageContext) return "New Conversation";
      
      const titlePrompt = `
        Generate a very short, concise title (3-5 words max) for a conversation that starts with:
        "${messageContext.substring(0, 100)}${messageContext.length > 100 ? '...' : ''}"
        
        The title should be specific to this conversation's content, not generic.
        Return ONLY the title with no quotes or additional text.
      `;
      
      // Call Supabase Edge Function to generate title
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: titlePrompt,
          type: 'conversation_title',
          maxTokens: 20
        }
      });
      
      if (error || data.error || !data.generatedText) {
        console.error('Error generating title:', error || data.error);
        return "New Conversation";
      }
      
      // Clean up the title - remove quotes and limit length
      const title = data.generatedText
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/^Title: /i, '')    // Remove "Title:" prefix if present
        .trim();
        
      return title || "New Conversation";
    } catch (error) {
      console.error('Error in generateTitle:', error);
      return "New Conversation";
    }
  },
  
  // Reset providers
  resetProviders: () => {
    console.log('Resetting AI providers');
  }
};

export { aiProviderService };
