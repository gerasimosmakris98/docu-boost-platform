import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ConversationType } from "./types/conversationTypes";
import { getTemplateFallbackResponse } from "./api/messageUtils";

export type AIProvider = 'openai' | 'perplexity' | 'fallback';

interface ProviderConfig {
  functionName: string;
  analyzeFunction: string;
  isAvailable: boolean;
}

// Configuration for our AI providers
const providers: Record<Exclude<AIProvider, 'fallback'>, ProviderConfig> = {
  openai: {
    functionName: 'generate-ai-response',
    analyzeFunction: 'analyze-file',
    isAvailable: true // Will be dynamically checked on first use
  },
  perplexity: {
    functionName: 'perplexity-ai-response',
    analyzeFunction: 'perplexity-analyze-file',
    isAvailable: true // Will be dynamically checked on first use
  }
};

// Keep track of which providers have been marked as unavailable
const unavailableProviders = new Set<AIProvider>();

// Default provider order - we'll try in this sequence
const providerOrder: AIProvider[] = ['perplexity', 'openai', 'fallback'];

/**
 * Try to use a specific AI provider to generate a response
 */
const tryProvider = async (
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
const tryFileAnalysisProvider = async (
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

/**
 * Get file analysis fallback response based on file type
 */
const getFileAnalysisFallback = (fileName: string, fileType: string): string => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
    return "I notice you've uploaded an image file. While I can't analyze it directly right now, here are some general tips for images in professional contexts:\n\n- For profile photos: ensure good lighting, a neutral background, and professional attire\n- For portfolio images: make sure they clearly showcase your work with good resolution\n- For documents saved as images: consider converting to PDF format for better readability\n\nFor more specific feedback, please try again later when our image analysis service is available.";
  } else if (fileExtension === 'pdf') {
    return "I notice you've uploaded a PDF document. While I can't analyze it directly right now, here are some general tips for professional PDFs:\n\n- Ensure consistent formatting throughout the document\n- Use clear section headings to improve readability\n- Include keywords relevant to your industry or target position\n- Keep resume PDFs to 1-2 pages maximum\n- Make sure all links are functional if it's a digital document\n\nFor more specific feedback, please try again later.";
  } else if (['doc', 'docx'].includes(fileExtension)) {
    return "I notice you've uploaded a Word document. While I can't analyze its content directly right now, here are some general tips for professional documents:\n\n- Use consistent formatting with standard fonts (Arial, Calibri, Times New Roman)\n- Include clear section headers\n- For resumes and CVs, focus on achievements rather than just responsibilities\n- Use bullet points for better readability\n- Check spelling and grammar thoroughly before finalizing\n\nFor more specific feedback, please try again later.";
  }
  
  return "I notice you've uploaded a file. While I can't analyze its content directly right now, here are some general tips for professional documents:\n\n- Ensure the document has a clear purpose and audience\n- Use consistent formatting throughout\n- Include relevant keywords for your industry\n- Focus on achievements and measurable results\n- Proofread carefully before sharing\n\nFor more specific feedback, please try again later.";
};

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
          return getTemplateFallbackResponse(prompt, type as ConversationType);
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
  analyzeFile: async (fileUrl: string, fileName: string, fileType: string, fileContent?: string): Promise<string> => {
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
   * Analyze a LinkedIn profile by generating a response with LinkedIn-specific prompt
   */
  analyzeLinkedInProfile: async (profileData: any): Promise<string> => {
    const prompt = `Analyze this LinkedIn profile and provide optimization suggestions: ${JSON.stringify(profileData)}`;
    return await aiProviderService.generateResponse(prompt, "linkedin_analysis");
  },
  
  /**
   * Reset unavailable providers - useful if a temporary quota issue resolved
   */
  resetProviders: () => {
    unavailableProviders.clear();
    console.log("Reset all AI providers to available status");
  }
};
