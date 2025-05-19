
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const openaiService = {
  generateResponse: async (prompt: string, type: string = "general"): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-response", {
        body: { prompt, type },
      });

      if (error) {
        // Check for quota error message pattern since we can't rely on status
        if (error.message?.includes('quota') || 
            error.message?.includes('insufficient_quota')) {
          console.warn('OpenAI API quota exceeded, returning fallback response');
          throw { 
            message: 'You exceeded your current quota, please check your plan and billing details.',
            status: 402
          };
        }
        throw new Error(error.message);
      }
      
      return data.generatedText || 'Sorry, I could not generate a response at this time.';
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      // Re-throw with the status code to handle it appropriately upstream
      if (error.status === 402) {
        throw error; 
      }
      throw error;
    }
  },
  
  analyzeFile: async (fileUrl: string, fileName: string, fileType: string): Promise<string> => {
    try {
      console.log('Analyzing file:', { fileUrl, fileName, fileType });
      
      const { data, error } = await supabase.functions.invoke("analyze-file", {
        body: { 
          fileUrl,
          fileName,
          fileType
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        // Check for quota error message pattern
        if (error.message?.includes('quota') || 
            error.message?.includes('insufficient_quota')) {
          console.warn('OpenAI API quota exceeded, returning fallback response');
          throw { 
            message: 'You exceeded your current quota, please check your plan and billing details.',
            status: 402
          };
        }
        throw new Error(error.message);
      }
      
      if (!data || !data.analysis) {
        throw new Error('No analysis data received from the server');
      }
      
      return data.analysis || 'Sorry, I could not analyze this file at this time.';
    } catch (error: any) {
      console.error('Error analyzing file:', error);
      throw error;
    }
  },
  
  analyzeLinkedInProfile: async (profileData: any): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-response", {
        body: { 
          prompt: `Analyze this LinkedIn profile and provide optimization suggestions: ${JSON.stringify(profileData)}`,
          type: "linkedin_analysis"
        },
      });

      if (error) {
        // Check for quota error message pattern
        if (error.message?.includes('quota') || 
            error.message?.includes('insufficient_quota')) {
          console.warn('OpenAI API quota exceeded, returning fallback response');
          throw { 
            message: 'You exceeded your current quota, please check your plan and billing details.',
            status: 402
          };
        }
        throw new Error(error.message);
      }
      
      return data.generatedText || 'Sorry, I could not analyze this LinkedIn profile at this time.';
    } catch (error: any) {
      console.error('Error analyzing LinkedIn profile:', error);
      throw error;
    }
  }
};
