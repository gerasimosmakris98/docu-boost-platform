
import { AIModelOptions, ProgressiveResponseOptions, ConversationType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced version of the AI provider service
const aiProviderService = {
  // Generate a response using the AI provider
  generateResponse: async (
    prompt: string, 
    conversationType: ConversationType,
    options?: AIModelOptions & ProgressiveResponseOptions
  ): Promise<string> => {
    console.log('Generating response for:', conversationType);
    
    try {
      // Enhance the prompt with instructions for better responses
      const enhancedPrompt = `
        You are an AI career advisor helping with ${conversationType}.
        
        Guidelines for your response:
        - Be detailed and helpful
        - Provide personalized advice based on the user's context and background
        - Use clear formatting with headings, bullet points, and paragraphs
        - Be conversational and engaging
        - Provide specific examples when relevant
        - Avoid generic advice without context
        
        User query: ${prompt}
      `;
      
      // Call Supabase Edge Function to generate AI response
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: { 
          prompt: enhancedPrompt,
          type: conversationType 
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
      
      // Provide a helpful fallback response
      return `I apologize, but I'm having trouble generating a detailed response at the moment. 

Here are some general tips regarding ${conversationType}:

## General Advice

- Make sure your materials are tailored to your specific background and target opportunities
- Focus on emphasizing your most relevant skills and achievements for each application
- Quantify your accomplishments with specific metrics when possible (e.g., "increased sales by 25%")
- Maintain a consistent professional tone across all communications
- Seek feedback from industry professionals before finalizing your materials

Please try again later for more personalized advice. If this issue persists, you might want to refresh the page or contact support.`;
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
      // Create file analysis prompt
      const fileAnalysisPrompt = `
        Please analyze this ${fileType} file: ${fileName}
        
        ${profileContext ? `User profile context: ${profileContext}` : ''}
        
        Guidelines for your analysis:
        - Provide detailed feedback on the content
        - Suggest specific improvements
        - Focus on organization, clarity, and impact
        - Consider industry standards and best practices
        - Identify strengths and areas for improvement
      `;
      
      // Call Supabase Edge Function to analyze file
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: { 
          prompt: fileAnalysisPrompt,
          type: 'file_analysis' 
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
      
      // Provide a helpful fallback response for file analysis
      return `I apologize, but I'm having trouble analyzing your file at the moment. 

Based on the file type (${fileType}), here are some general considerations:

## File Analysis - ${fileName}

- Ensure your document follows industry standard formatting and organization
- Check for clarity, conciseness, and proper grammar throughout
- Make sure key information is prominently highlighted
- Consider the target audience and tailor the content accordingly
- Review for consistency in style, tone, and terminology

Please try again later for a more detailed analysis. If this issue persists, you might want to refresh the page or try a different file format.`;
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
      // Create URL analysis prompt
      const urlAnalysisPrompt = `
        Please analyze this ${type} URL: ${url}
        
        ${profileContext ? `User profile context: ${profileContext}` : ''}
        
        Guidelines for your analysis:
        - Provide detailed feedback on the content of the URL
        - Suggest specific ways the user can use this information
        - Focus on how this relates to the user's career development
        - Consider industry standards and best practices
        - Identify key takeaways from the content
      `;
      
      // Call Supabase Edge Function to analyze URL
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: { 
          prompt: urlAnalysisPrompt,
          type: 'url_analysis' 
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
      
      // Provide a helpful fallback response for URL analysis
      return `I apologize, but I'm having trouble analyzing this URL at the moment.

Regarding this ${type} resource (${url}), here are some general considerations:

## URL Analysis

- Consider how the information from this resource can be applied to your career development
- Look for specific insights that relate to your current goals and challenges
- Compare the advice or information with other industry resources for validation
- Extract actionable steps you can implement immediately
- Consider how you might reference or incorporate this information in your professional materials

Please try again later for a more detailed analysis. If this issue persists, you might want to refresh the page or try a different URL.`;
    }
  },
  
  // Reset unavailable providers list
  resetProviders: () => {
    console.log('Resetting AI providers');
  }
};

export { aiProviderService };
