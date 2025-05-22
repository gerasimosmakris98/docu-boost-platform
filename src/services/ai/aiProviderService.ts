
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
  ): Promise<string> => {
    console.log('Generating response for:', conversationType);
    
    try {
      // Create a more conversational prompt that encourages brief, natural responses with citations
      const enhancedPrompt = `
        You are a friendly AI career advisor having a concise conversation. 
        
        Guidelines:
        - Be extremely brief and conversational (max 2 short paragraphs)
        - Only respond directly to what was asked
        - Use a friendly, supportive tone
        - If referring to sources, use numbered citations like [1], [2]
        - Personalize based on any context about the user's background
        - Avoid introductions or conclusions
        - Respond like you're texting a friend
        
        User message: ${prompt}
      `;
      
      // Call Supabase Edge Function to generate AI response
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: enhancedPrompt,
          type: conversationType,
          maxTokens: 200, // Limit token count for brevity
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
      
      return data.generatedText;
    } catch (error) {
      console.error('Error in generateResponse:', error);
      
      // Provide a brief, helpful fallback response
      return `I'm having trouble responding right now. Let me know if you'd like some quick tips while I recover.`;
    }
  },
  
  // Analyze a file using the AI provider
  analyzeFile: async (
    fileUrl: string,
    fileName: string,
    fileType: string,
    profileContext?: string,
    options?: AIModelOptions
  ): Promise<string> => {
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
        - If referring to specific parts, use numbered citations [1], [2]
      `;
      
      // Call Supabase Edge Function to analyze file
      const { data, error } = await supabase.functions.invoke('perplexity-ai-response', {
        body: { 
          prompt: fileAnalysisPrompt,
          type: 'file_analysis',
          maxTokens: 250
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
      
      return data.generatedText;
    } catch (error) {
      console.error('Error in analyzeFile:', error);
      
      // Provide a brief fallback response for file analysis
      return `I couldn't analyze your file in detail right now. Would you like to try again in a moment?`;
    }
  },
  
  // Analyze a URL using the AI provider
  analyzeUrl: async (
    url: string, 
    type: string, 
    profileContext?: string
  ): Promise<string> => {
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
        - If referring to specific parts, use numbered citations [1], [2]
      `;
      
      // Call Supabase Edge Function to analyze URL
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
      
      if (!data.generatedText) {
        throw new Error('No analysis received from AI service');
      }
      
      return data.generatedText;
    } catch (error) {
      console.error('Error in analyzeUrl:', error);
      
      // Provide a brief fallback response for URL analysis
      return `I couldn't analyze that URL in detail. Would you like me to try again?`;
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
        Generate a very short, concise title (4-5 words max) for a conversation that starts with:
        "${messageContext.substring(0, 100)}${messageContext.length > 100 ? '...' : ''}"
        
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
