import { AIProvider, ConversationType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfileContext } from '../api/profileUtils';

// Keep track of unavailable providers
export const unavailableProviders = new Set<AIProvider>();

// Try a provider with the given prompt, fall back if it fails
export const tryProvider = async (
  provider: AIProvider,
  prompt: string,
  conversationType: ConversationType,
  userId?: string
): Promise<string> => {
  if (unavailableProviders.has(provider)) {
    throw new Error(`Provider ${provider} is marked as unavailable`);
  }
  
  try {
    // Get user profile information to enhance the AI's context
    const userProfileContext = await getUserProfileContext(userId);
    const enhancedPrompt = userProfileContext ? `${userProfileContext}\n\n${prompt}` : prompt;
    
    // For now, we'll just return a mock response
    // In a real implementation, this would make an API call to the provider
    return `I've analyzed your profile and here are my thoughts on ${conversationType}:
    
    • First, make sure your materials are tailored to your specific background and target opportunities
    • Based on your experience, highlight your most relevant skills and achievements
    • Quantify your accomplishments with specific metrics when possible
    • Maintain a consistent professional tone across all your communications
    • Consider seeking feedback from industry professionals before finalizing your materials`;
  } catch (error) {
    console.error(`Error with provider ${provider}:`, error);
    unavailableProviders.add(provider);
    throw error;
  }
};

// Analyze a file
export const tryFileAnalysisProvider = async (
  provider: AIProvider,
  fileUrl: string,
  fileName: string,
  fileType: string,
  enhancedPrompt?: string
): Promise<string> => {
  if (unavailableProviders.has(provider)) {
    throw new Error(`Provider ${provider} is marked as unavailable`);
  }
  
  try {
    // For now, we'll just return a mock response
    let response = `I've analyzed your ${fileName} and here are my observations:`;
    
    if (fileType.includes('image')) {
      response += `
    
    • The image appears to be professionally composed and suitable for career purposes
    • The visual elements effectively communicate your professional identity
    • Consider how this visual representation aligns with your industry standards
    • The quality and clarity of the image are appropriate for professional use
    • This visual asset could strengthen your overall professional presentation`;
    } else if (fileType.includes('pdf') || fileType.includes('doc')) {
      response += `
    
    • The document is well-structured with clear sections and appropriate formatting
    • Your qualifications and experience are presented in a logical sequence
    • I recommend enhancing the achievements section with more quantifiable results
    • The language is professional, though some statements could be more concise
    • Overall, this is a strong document that effectively represents your professional background`;
    } else {
      response += `
    
    • The file contains valuable information that could support your career development
    • The content appears to be organized in a coherent and accessible manner
    • Consider how you might incorporate these elements into your career strategy
    • Look for opportunities to highlight the most relevant aspects for your goals
    • This material could serve as a useful reference for future professional endeavors`;
    }
    
    return response;
  } catch (error) {
    console.error(`Error with file analysis provider ${provider}:`, error);
    unavailableProviders.add(provider);
    throw error;
  }
};
