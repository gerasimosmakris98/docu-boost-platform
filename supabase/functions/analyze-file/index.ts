
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
    console.log('Analyze file function called');
    const { fileUrl, fileName, fileType } = await req.json();
    
    console.log('Request data:', { fileUrl, fileName, fileType });
    
    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    // Download the file from Supabase Storage
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    let prompt = '';
    
    // Handle different file types with appropriate prompts
    if (fileType.startsWith('image/')) {
      // For images, use the URL directly with GPT-4 Vision model
      prompt = `This is an image file named "${fileName}". Please analyze it in the context of a career document or profile. If it appears to be a resume, LinkedIn profile, or other career document, provide feedback on how it can be improved. If it's a photo of a person, suggest how it could be optimized for professional use.`;
      
      console.log('Using image analysis with GPT-4 Vision');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { 
              role: 'system', 
              content: 'You are an AI assistant that analyzes files and images for career advising purposes. You provide detailed, helpful feedback that helps users improve their career documents and profiles.'
            },
            { 
              role: 'user', 
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: fileUrl } }
              ]
            }
          ],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log('OpenAI response received');
      const analysis = data.choices[0].message.content;
      
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (fileType === 'application/pdf' || 
               fileType === 'application/msword' || 
               fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For document files
      if (fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv')) {
        prompt = `This is a document file named "${fileName}" which appears to be a resume or CV. Please provide detailed feedback on how to improve this document for job applications, focusing on formatting, content structure, keywords, and overall impact.`;
      } else if (fileName.toLowerCase().includes('cover') && fileName.toLowerCase().includes('letter')) {
        prompt = `This is a document file named "${fileName}" which appears to be a cover letter. Please provide detailed feedback on how to improve this cover letter, focusing on persuasiveness, relevance to the job, structure, and overall impact.`;
      } else if (fileName.toLowerCase().includes('linkedin')) {
        prompt = `This is a document file named "${fileName}" which appears to be related to a LinkedIn profile. Please provide detailed feedback on how to optimize this LinkedIn content for better visibility and professional impact.`;
      } else {
        prompt = `This is a document file named "${fileName}". Please analyze this document and provide feedback on how it could be improved for professional use. Consider structure, clarity, persuasiveness, and relevance to career advancement.`;
      }
      
      console.log('Using document analysis');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an AI assistant that analyzes resumes, cover letters, and other career documents. You provide detailed, constructive feedback to help users improve their documents for better career outcomes.' 
            },
            { 
              role: 'user', 
              content: prompt 
            }
          ],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log('OpenAI response received');
      const analysis = data.choices[0].message.content;
      
      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // For other file types
      console.log('Unsupported file type:', fileType);
      return new Response(JSON.stringify({ 
        analysis: `File type ${fileType} is not currently supported for analysis. Please upload an image, PDF, or document file.` 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in analyze-file function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
