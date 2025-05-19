
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, fileType } = await req.json();
    
    // Download the file from Supabase Storage
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    let fileContent;
    let prompt;
    
    // Handle different file types
    if (fileType.startsWith('image/')) {
      // For images, use the URL directly with GPT-4 Vision model
      prompt = `This is an image file named "${fileName}". Please analyze it and provide insights.`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are an AI assistant that analyzes files and images for career advising purposes.' },
            { role: 'user', content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: fileUrl } }
            ]}
          ],
        }),
      });
      
      const data = await response.json();
      const analysis = data.choices[0].message.content;
      
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (fileType === 'application/pdf' || 
               fileType === 'application/msword' || 
               fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For document files, we'd use document parsers
      // This is a simplified implementation
      prompt = `This is a document file named "${fileName}". The document appears to be a resume or CV. Please provide feedback on how to improve this document for job applications.`;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an AI assistant that analyzes resumes and documents for career advising purposes.' },
            { role: 'user', content: prompt }
          ],
        }),
      });
      
      const data = await response.json();
      const analysis = data.choices[0].message.content;
      
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // For other file types
      return new Response(JSON.stringify({ 
        analysis: `File type ${fileType} is not currently supported for analysis.` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in analyze-file function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
