
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
      const { data, error } = await supabase.functions.invoke("analyze-file", {
        body: { 
          fileUrl,
          fileName,
          fileType
        },
      });

      if (error) throw new Error(error.message);
      
      return data.analysis || 'Sorry, I could not analyze this file at this time.';
    } catch (error: any) {
      console.error('Error analyzing file:', error);
      throw new Error(error.message || 'Failed to analyze file');
    }
  }
}
