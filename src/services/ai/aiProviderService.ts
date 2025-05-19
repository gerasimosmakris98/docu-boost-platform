
import { aiProviderService as baseAiProviderService } from './aiProviderService';
import { AIModelOptions, ProgressiveResponseOptions, ConversationType } from './types';

// Enhanced version of the AI provider service with better response formatting
const aiProviderService = {
  // Override the generateResponse method to add response formatting
  generateResponse: async (
    prompt: string, 
    conversationType: ConversationType,
    options?: AIModelOptions & ProgressiveResponseOptions
  ): Promise<string> => {
    // Enhance the prompt with instructions for concise, relevant responses
    const enhancedPrompt = `
      You are an AI career advisor helping with ${conversationType}.
      
      Guidelines for your response:
      - Be concise and direct
      - Focus on practical, actionable advice
      - Limit responses to 3-5 key points
      - Use bullet points for clarity when appropriate
      - Avoid overly verbose explanations
      
      User query: ${prompt}
    `;
    
    // Set default options for more concise responses
    const defaultOptions: AIModelOptions & ProgressiveResponseOptions = {
      temperature: 0.6,
      maxTokens: 800,
      brief: true,
      depth: 'medium',
      format: 'bullets'
    };
    
    // Merge user options with defaults
    const mergedOptions = {
      ...defaultOptions,
      ...options
    };
    
    // Call the base service with enhanced prompt and options
    return await baseAiProviderService.generateResponse(
      enhancedPrompt, 
      conversationType, 
      mergedOptions
    );
  },
  
  // Pass through other methods from the base service
  analyzeFile: baseAiProviderService.analyzeFile,
  analyzeUrl: baseAiProviderService.analyzeUrl
};

export { aiProviderService };
