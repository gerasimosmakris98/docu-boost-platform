
import { aiProviderService } from './aiProviderService';
import { ConversationType } from './types';

/**
 * Analyze a LinkedIn profile by generating a response with LinkedIn-specific prompt
 */
export const analyzeLinkedInProfile = async (profileData: any): Promise<string> => {
  const prompt = `Analyze this LinkedIn profile and provide optimization suggestions: ${JSON.stringify(profileData)}`;
  return await aiProviderService.generateResponse(prompt, "linkedin_analysis" as ConversationType);
};
