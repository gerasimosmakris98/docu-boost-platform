
import { supabase } from "@/integrations/supabase/client";
import { AIProvider } from './types';
import { providers, unavailableProviders } from './providerConfigs';

/**
 * Try to use a specific AI provider to generate a response
 */
export const tryProvider = async (
  provider: Exclude<AIProvider, 'fallback'>, 
  prompt: string, 
  type: string
): Promise<string> => {
  try {
    console.log(`Trying ${provider} provider for type: ${type}`);
    
    // Skip if this provider has been marked as unavailable
    if (unavailableProviders.has(provider)) {
      console.log(`Skipping ${provider} - marked as unavailable`);
      throw new Error(`${provider} is unavailable`);
    }
    
    const config = providers[provider];
    const { data, error } = await supabase.functions.invoke(config.functionName, {
      body: { prompt, type },
    });

    if (error) {
      // Check for quota error or rate limit
      if (error.message?.includes('quota') || 
          error.message?.includes('rate limit') ||
          error.message?.includes('insufficient_quota')) {
        console.warn(`${provider} API quota or rate limit exceeded`);
        // Mark this provider as unavailable for this session
        unavailableProviders.add(provider);
        throw { 
          message: `${provider} quota exceeded`,
          status: 429
        };
      }
      throw new Error(error.message);
    }
    
    return data.generatedText || `Sorry, I could not generate a response using ${provider} at this time.`;
  } catch (error: any) {
    console.error(`Error with ${provider} provider:`, error);
    throw error;
  }
};

/**
 * Try to use a specific AI provider to analyze a file
 */
export const tryFileAnalysisProvider = async (
  provider: Exclude<AIProvider, 'fallback'>,
  fileUrl: string, 
  fileName: string, 
  fileType: string,
  fileContent?: string
): Promise<string> => {
  try {
    console.log(`Trying ${provider} provider for file analysis`);
    
    // Skip if this provider has been marked as unavailable
    if (unavailableProviders.has(provider)) {
      console.log(`Skipping ${provider} - marked as unavailable`);
      throw new Error(`${provider} is unavailable`);
    }
    
    const config = providers[provider];
    const { data, error } = await supabase.functions.invoke(config.analyzeFunction, {
      body: { 
        fileUrl,
        fileName,
        fileType,
        fileContent
      },
    });

    if (error) {
      // Check for quota or rate limit errors
      if (error.message?.includes('quota') || 
          error.message?.includes('rate limit') ||
          error.message?.includes('insufficient_quota')) {
        console.warn(`${provider} API quota or rate limit exceeded for file analysis`);
        // Mark this provider as unavailable for this session
        unavailableProviders.add(provider);
        throw { 
          message: `${provider} quota exceeded`,
          status: 429
        };
      }
      throw new Error(error.message);
    }
    
    if (!data || !data.analysis) {
      throw new Error('No analysis data received from the server');
    }
    
    return data.analysis;
  } catch (error: any) {
    console.error(`Error with ${provider} file analysis:`, error);
    throw error;
  }
};
