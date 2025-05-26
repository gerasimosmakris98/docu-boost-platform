
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
    console.log('Generating response for:', conversationType);
    
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
      
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: enhancedPrompt,
          type: conversationType,
          maxTokens: options?.maxTokens || 200,
          brief: options?.brief || true
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
      
      if (!data.generatedText || typeof data.generatedText !== 'string') {
        throw new Error('No valid response received from AI service');
      }
      
      return data.generatedText;
    } catch (error) {
      console.error('Error in generateResponse:', error);
      return `I'm having trouble responding right now. Could you try rephrasing your question?`;
    }
  },
  
  // Generate a structured response with citations
  generateStructuredResponse: async (
    prompt: string, 
    conversationType: ConversationType,
    options?: AIModelOptions & ProgressiveResponseOptions
  ): Promise<StructuredResponse> => {
    console.log('Generating structured response for:', conversationType);
    
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
      
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: enhancedPrompt,
          type: conversationType,
          maxTokens: options?.maxTokens || 200,
          brief: options?.brief || true
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
      
      // Try to parse as JSON, fallback to plain text
      try {
        const parsedResponse = JSON.parse(data.generatedText);
        if (typeof parsedResponse.generatedText === 'string' && Array.isArray(parsedResponse.sourceUrls)) {
          return parsedResponse;
        }
      } catch (parseError) {
        console.warn("Response not in JSON format, treating as plain text");
      }
      
      // Fallback: return as plain text response
      return { 
        generatedText: data.generatedText, 
        sourceUrls: [] 
      };
    } catch (error) {
      console.error('Error in generateStructuredResponse:', error);
      return { 
        generatedText: `I'm having trouble responding right now. Could you try rephrasing your question?`, 
        sourceUrls: [] 
      };
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
    console.log('Analyzing file:', fileName, fileType);
    
    try {
      const analysisPrompt = systemPrompt || `
        Analyze this ${fileType} file: ${fileName}
        
        Guidelines:
        - Provide specific, actionable feedback
        - Highlight 2-3 key strengths
        - Suggest 2-3 specific improvements
        - Be conversational and supportive
      `;
      
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: analysisPrompt,
          type: 'file_analysis',
          maxTokens: options?.maxTokens || 300
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
      
      if (!data.generatedText || typeof data.generatedText !== 'string') {
        throw new Error('No analysis received from AI service');
      }
      
      return data.generatedText;
    } catch (error) {
      console.error('Error in analyzeFile:', error);
      return `I couldn't analyze your file in detail right now. Please try again in a moment.`;
    }
  },
  
  // Analyze a URL
  analyzeUrl: async (
    url: string, 
    type: string, 
    profileContext?: string
  ): Promise<string> => {
    console.log('Analyzing URL:', url, type);
    
    try {
      const urlAnalysisPrompt = `
        Analyze this ${type} URL: ${url}
        
        ${profileContext ? `Context: ${profileContext}` : ''}
        
        Guidelines:
        - Provide 2-3 key takeaways
        - Give specific, actionable advice
        - Be conversational and helpful
      `;
      
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: urlAnalysisPrompt,
          type: 'url_analysis',
          maxTokens: 250
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
      
      if (!data.generatedText || typeof data.generatedText !== 'string') {
        throw new Error('No analysis received from AI service');
      }

      // Check for failure patterns
      const failurePatterns = [
        "i cannot access this url",
        "i can't access that link",
        "i am unable to access external websites",
        "could not retrieve content",
        "unable to fetch"
      ];

      const lowercaseText = data.generatedText.toLowerCase();
      const hasFailurePattern = failurePatterns.some(pattern => lowercaseText.includes(pattern));
      
      if (hasFailurePattern || data.generatedText.length < 30) {
        return "I tried to analyze the URL, but couldn't access the content. This can happen if the website blocks automated access or requires login. You could try summarizing the key points from the URL and asking me about those.";
      }
      
      return data.generatedText;
    } catch (error) {
      console.error('Error in analyzeUrl:', error);
      return `I couldn't analyze that URL right now. Would you like to try again?`;
    }
  },
  
  // Generate conversation title
  generateTitle: async (
    messages: {role: string, content: string}[]
  ): Promise<string> => {
    if (messages.length === 0) return "New Conversation";
    
    try {
      const messageContext = messages
        .filter(msg => msg.role === 'user')
        .slice(0, 2)
        .map(msg => msg.content)
        .join('\n');
        
      if (!messageContext) return "New Conversation";
      
      const titlePrompt = `
        Generate a short title (4-5 words max) for a conversation starting with:
        "${messageContext.substring(0, 100)}${messageContext.length > 100 ? '...' : ''}"
        
        Return ONLY the title, no quotes or extra text.
      `;
      
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
      
      const title = data.generatedText
        .replace(/^["']|["']$/g, '')
        .replace(/^Title: /i, '')
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
