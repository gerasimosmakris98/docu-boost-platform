
import { aiProviderService } from './aiProviderService';

/**
 * LinkedIn profile optimization service
 */
export const linkedInService = {
  optimizeProfile: async (profileData: any): Promise<string> => {
    const prompt = `
      Optimize this LinkedIn profile for better visibility and engagement:
      ${JSON.stringify(profileData, null, 2)}
      
      Provide specific recommendations for:
      - Headline optimization
      - Summary improvements
      - Skills optimization
      - Experience descriptions
    `;
    
    return await aiProviderService.generateResponse(prompt, 'linkedin');
  }
};
