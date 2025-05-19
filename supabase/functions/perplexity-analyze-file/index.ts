import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Perplexity analyze file function called');
    const { fileUrl, fileName, fileType, fileContent } = await req.json();
    
    console.log('Request data:', { fileUrl, fileName, fileType });
    
    if (!fileUrl && !fileContent) {
      throw new Error('Either file URL or file content is required');
    }

    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY environment variable not set');
      throw new Error('Perplexity API key is not configured');
    }

    // For text-based file analysis using Perplexity (doesn't support direct file upload)
    // We'll create an appropriate prompt based on the file name and type
    let analysisPrompt = '';
    
    if (fileName.toLowerCase().includes('resume') || fileName.toLowerCase().includes('cv')) {
      analysisPrompt = `This is a document named "${fileName}" which appears to be a resume or CV. Please provide detailed feedback on how to improve this document for job applications, focusing on formatting, content structure, keywords, and overall impact.`;
    } else if (fileName.toLowerCase().includes('cover') && fileName.toLowerCase().includes('letter')) {
      analysisPrompt = `This is a document named "${fileName}" which appears to be a cover letter. Please provide detailed feedback on how to improve this cover letter, focusing on persuasiveness, relevance to the job, structure, and overall impact.`;
    } else if (fileName.toLowerCase().includes('linkedin')) {
      analysisPrompt = `This is a document named "${fileName}" which appears to be related to a LinkedIn profile. Please provide detailed feedback on how to optimize this LinkedIn content for better visibility and professional impact.`;
    } else {
      analysisPrompt = `This is a document file named "${fileName}". Please analyze this document and provide feedback on how it could be improved for professional use. Consider structure, clarity, persuasiveness, and relevance to career advancement.`;
    }
    
    // If we have text content from the file, add it to the prompt
    if (fileContent) {
      analysisPrompt += `\n\nHere is the content to analyze:\n\n${fileContent}`;
    } else {
      // Otherwise note that we only have metadata
      analysisPrompt += `\n\nNote: I only have the file name and type, but not the actual content. Please provide general advice based on the file type and name.`;
    }
    
    console.log('Using file analysis prompt with Perplexity');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI assistant that analyzes resumes, cover letters, and other career documents. You provide detailed, constructive feedback to help users improve their documents for better career outcomes.' 
          },
          { 
            role: 'user', 
            content: analysisPrompt 
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API error:', errorData);
      
      // Check for quota or rate limit exceeded
      if (response.status === 429 || 
          errorData.error?.type === 'insufficient_quota' || 
          errorData.error?.message?.includes('rate limit')) {
        console.warn('Perplexity API quota or rate limit exceeded');
        
        return new Response(JSON.stringify({ 
          error: "Perplexity API quota or rate limit exceeded",
          errorCode: "rate_limited",
          message: errorData.error?.message || "Rate limit exceeded. Please try again later."
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Perplexity API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('Perplexity response received');
    const analysis = data.choices[0].message.content;
    
    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in perplexity-analyze-file function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error occurred' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
