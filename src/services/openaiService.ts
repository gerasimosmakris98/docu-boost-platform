
import { supabase } from "@/integrations/supabase/client";

export const openaiService = {
  generateResponse: async (prompt: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-response", {
        body: { prompt },
      });

      if (error) throw new Error(error.message);
      
      return data.generatedText || 'Sorry, I could not generate a response at this time.';
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      throw new Error(error.message || 'Failed to generate AI response');
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
        throw new Error(error.message);
      }
      
      if (!data || !data.analysis) {
        throw new Error('No analysis data received from the server');
      }
      
      return data.analysis || 'Sorry, I could not analyze this file at this time.';
    } catch (error: any) {
      console.error('Error analyzing file:', error);
      throw new Error(error.message || 'Failed to analyze file');
    }
  },
  
  // New method to analyze LinkedIn profiles
  analyzeLinkedInProfile: async (profileData: any): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke("generate-ai-response", {
        body: { 
          prompt: `Analyze this LinkedIn profile and provide optimization suggestions: ${JSON.stringify(profileData)}`,
          type: "linkedin_analysis"
        },
      });

      if (error) throw new Error(error.message);
      
      return data.generatedText || 'Sorry, I could not analyze this LinkedIn profile at this time.';
    } catch (error: any) {
      console.error('Error analyzing LinkedIn profile:', error);
      throw new Error(error.message || 'Failed to analyze LinkedIn profile');
    }
  }
};
