
import { providerOrder, unavailableProviders } from './providerConfigs';
import { AIProvider, FileAnalysisOptions } from './types';
import { tryProvider, tryFileAnalysisProvider } from './providerService';
import { getFileAnalysisFallback, getFallbackResponse } from './fallbackService';
import { analyzeLinkedInProfile } from './linkedInService';

export const aiProviderService = {
  /**
   * Generate a response by trying multiple AI providers in sequence
   */
  generateResponse: async (prompt: string, type: string = "general"): Promise<string> => {
    // Try each provider in order until one works
    for (const provider of providerOrder) {
      try {
        if (provider === 'fallback') {
          // If we get to fallback, use template-based response
          console.log("All providers failed, using fallback template response");
          return getFallbackResponse(prompt, type);
        }
        
        // Try the current provider
        return await tryProvider(provider, prompt, type);
      } catch (error: any) {
        console.warn(`Provider ${provider} failed:`, error);
        // Continue to next provider
        continue;
      }
    }
    
    // If all providers fail, return a basic fallback
    return "I apologize, but I'm currently experiencing technical limitations. Please try again later.";
  },
  
  /**
   * Analyze a file by trying multiple AI providers in sequence
   */
  analyzeFile: async (
    fileUrl: string, 
    fileName: string, 
    fileType: string, 
    fileContent?: string
  ): Promise<string> => {
    // Try each provider in order until one works
    for (const provider of providerOrder) {
      try {
        if (provider === 'fallback') {
          // If we get to fallback, use template-based file analysis
          console.log("All providers failed for file analysis, using fallback");
          return getFileAnalysisFallback(fileName, fileType);
        }
        
        // Try the current provider
        return await tryFileAnalysisProvider(provider, fileUrl, fileName, fileType, fileContent);
      } catch (error: any) {
        console.warn(`Provider ${provider} failed for file analysis:`, error);
        // Continue to next provider
        continue;
      }
    }
    
    // If all providers fail, return a basic fallback
    return "I apologize, but I'm currently unable to analyze your file due to technical limitations. Please try again later.";
  },
  
  /**
   * Analyze a LinkedIn profile
   */
  analyzeLinkedInProfile,
  
  /**
   * Reset unavailable providers - useful if a temporary quota issue resolved
   */
  resetProviders: () => {
    unavailableProviders.clear();
    console.log("Reset all AI providers to available status");
  }
};

// Re-export the type for other modules to use
export { AIProvider };
