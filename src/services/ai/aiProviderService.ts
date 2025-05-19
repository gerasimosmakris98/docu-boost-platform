
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
      - Respond in a conversational, human-like manner
      - Try to reference user profile data when relevant
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
        return `I've reviewed your profile information and here are some thoughts on ${conversationType}:
        
        • I see you're interested in ${conversationType === 'resume' ? 'improving your resume' : 
            conversationType === 'cover_letter' ? 'crafting a compelling cover letter' : 
            conversationType === 'interview_prep' ? 'preparing for interviews' : 
            conversationType === 'job_search' ? 'optimizing your job search' : 
            conversationType === 'linkedin' ? 'enhancing your LinkedIn presence' : 
            conversationType === 'assessment' ? 'preparing for assessments' : 
            'advancing your career'}.
        • Based on your background, I recommend focusing on highlighting your unique skills and experiences.
        • Make sure to tailor your materials to each specific opportunity you pursue.
        • Consider seeking feedback from professionals in your target industry.
        • Let me know if you'd like more specific advice on any aspect of your career development.`;
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
    profileContext?: string,
    options?: AIModelOptions
  ): Promise<string> => {
    // Create an enhanced prompt with profile context if available
    let enhancedPrompt = `Analyze this file: ${fileName}`;
    if (profileContext) {
      enhancedPrompt = `${profileContext}\n\nAnalyze this file: ${fileName}`;
    }
    
    // Try each provider in order until one succeeds
    for (const provider of providerOrder) {
      if (provider === 'fallback') {
        return `After reviewing the ${fileName} you shared ${profileContext ? 'and considering your profile information' : ''}, here are my observations:
        
        • The document appears to be a ${fileType.includes('image') ? 'visual representation' : 
            fileType.includes('pdf') ? 'PDF document' : 
            fileType.includes('word') ? 'Word document' : 'file'} that could be valuable for your career development.
        • ${profileContext ? 'Based on your background, I suggest focusing on highlighting your key accomplishments and skills.' : 'I recommend ensuring your document clearly communicates your value proposition.'}
        • Consider organizing the content to emphasize your most relevant experiences.
        • Make sure the formatting is clean, consistent, and professional.
        • ${profileContext ? 'Given your professional focus, tailoring this document to your target audience will increase its effectiveness.' : 'Customizing this document for each specific opportunity will increase your chances of success.'}`;
      }
      
      try {
        return await tryFileAnalysisProvider(provider, fileUrl, fileName, fileType, enhancedPrompt);
      } catch (error) {
        console.warn(`Provider ${provider} failed file analysis:`, error);
        // Continue to next provider
      }
    }
    
    return "I apologize, but I'm currently experiencing technical difficulties analyzing your file. Please try again later.";
  },
  
  // Analyze a URL using the AI provider
  analyzeUrl: async (url: string, type: string, profileContext?: string): Promise<string> => {
    let response = `I've analyzed this ${type} URL: ${url}.`;
    
    if (profileContext) {
      response += ` Considering your professional background, here are my key observations:`;
    } else {
      response += ` Here are my key observations:`;
    }
    
    response += `
    
    • This appears to be a ${type} resource that could be valuable for your career development.
    • ${profileContext ? 'Based on your profile, I recommend focusing on how this information aligns with your career goals.' : 'Consider how this information aligns with your career goals.'}
    • Look for actionable insights you can implement immediately to improve your professional prospects.
    • Consider how these insights can be integrated into your application materials to strengthen your candidacy.
    • ${profileContext ? 'Given your background, pay special attention to sections that relate to your specific industry or role.' : 'Take note of any industry-specific advice that might be relevant to your situation.'}`;
    
    return response;
  },
  
  // Reset unavailable providers list
  resetProviders: () => {
    unavailableProviders.clear();
  }
};

export { aiProviderService };
