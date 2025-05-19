import { AIProvider, ConversationType } from './types';
import { supabase } from '@/integrations/supabase/client';

// Keep track of unavailable providers
export const unavailableProviders = new Set<AIProvider>();

// Get user profile data for enhancing AI responses
async function getUserProfileContext(userId: string | undefined): Promise<string> {
  if (!userId) return '';
  
  try {
    // Get basic profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    // Get social links
    const { data: socialLinks, error: socialLinksError } = await supabase
      .from('social_links')
      .select('*')
      .eq('user_id', userId);
    
    if (socialLinksError) throw socialLinksError;
    
    // Format the profile context
    let contextString = 'USER PROFILE CONTEXT:\n';
    
    if (profile) {
      contextString += `Name: ${profile.full_name || 'Unknown'}\n`;
      contextString += profile.title ? `Title: ${profile.title}\n` : '';
      contextString += profile.summary ? `Professional Summary: ${profile.summary}\n` : '';
      contextString += profile.location ? `Location: ${profile.location}\n` : '';
    }
    
    if (socialLinks && socialLinks.length > 0) {
      contextString += '\nSOCIAL PROFILES:\n';
      socialLinks.forEach(link => {
        contextString += `${link.platform}: ${link.url}\n`;
      });
    }
    
    return contextString;
    
  } catch (error) {
    console.error('Error fetching user profile context:', error);
    return '';
  }
}

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
    return `Here are my thoughts on ${conversationType}:
    
    • First, make sure your resume is tailored to each job application
    • Highlight your most relevant skills and experiences
    • Quantify your achievements with specific metrics when possible
    • Keep your formatting clean and professional
    • Have someone review your materials before submitting`;
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
  fileType: string
): Promise<string> => {
  if (unavailableProviders.has(provider)) {
    throw new Error(`Provider ${provider} is marked as unavailable`);
  }
  
  try {
    // For now, we'll just return a mock response
    return `I've analyzed your ${fileName} and here are my observations:
    
    • The document is well-structured and professionally formatted
    • Consider adding more quantifiable achievements to strengthen your impact
    • Your skills section could be expanded to include more technical competencies
    • The summary section effectively highlights your core value proposition
    • Overall, this is a strong document that presents you well`;
  } catch (error) {
    console.error(`Error with file analysis provider ${provider}:`, error);
    unavailableProviders.add(provider);
    throw error;
  }
};
