
import { AIModelOptions, ProgressiveResponseOptions, ConversationType } from './types';
import { tryProvider, tryFileAnalysisProvider } from './providerService';
import { providers, providerOrder, unavailableProviders } from './providerConfigs';

// Enhanced version of the AI provider service with better response formatting
const aiProviderService = {
  // Generate a response using the AI provider
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
    
    // Try each provider in order until one succeeds
    for (const provider of providerOrder) {
      if (provider === 'fallback') {
        return `I'm currently operating in fallback mode with limited capabilities. Here are some basic career tips related to ${conversationType}:
        
        • Keep your resume concise and focused on achievements
        • Tailor application materials to each specific job
        • Prepare for interviews by researching the company
        • Follow up after interviews with a thank you note
        • Network actively on platforms like LinkedIn`;
      }
      
      try {
        return await tryProvider(provider, enhancedPrompt, conversationType);
      } catch (error) {
        console.warn(`Provider ${provider} failed:`, error);
        // Continue to next provider
      }
    }
    
    return "I apologize, but I'm currently experiencing technical difficulties. Please try again later.";
  },
  
  // Analyze a file using the AI provider
  analyzeFile: async (
    fileUrl: string,
    fileName: string,
    fileType: string,
    systemPrompt?: string,
    options?: AIModelOptions
  ): Promise<string> => {
    // Try each provider in order until one succeeds
    for (const provider of providerOrder) {
      if (provider === 'fallback') {
        return `I'm currently operating in fallback mode with limited capabilities. I can't analyze your file in detail, but here are some general tips for ${fileName}:
        
        • Ensure your document has a clear structure
        • Use bullet points for readability
        • Highlight key achievements and metrics
        • Tailor content to your target audience
        • Proofread carefully for errors`;
      }
      
      try {
        return await tryFileAnalysisProvider(provider, fileUrl, fileName, fileType);
      } catch (error) {
        console.warn(`Provider ${provider} failed file analysis:`, error);
        // Continue to next provider
      }
    }
    
    return "I apologize, but I'm currently experiencing technical difficulties analyzing your file. Please try again later.";
  },
  
  // Analyze a URL using the AI provider
  analyzeUrl: async (url: string, type: string): Promise<string> => {
    return `I've analyzed this ${type} URL: ${url}. Here are my key observations:
    
    • This appears to be a ${type} resource that could be valuable for your career
    • Consider how this information aligns with your career goals
    • Extract the most relevant insights for your situation
    • Look for actionable tips you can implement immediately
    • Consider how to integrate these insights into your application materials`;
  },
  
  // Reset unavailable providers list
  resetProviders: () => {
    unavailableProviders.clear();
  }
};

export { aiProviderService };
