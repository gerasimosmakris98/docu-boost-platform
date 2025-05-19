
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
    console.log('Perplexity file analysis function called');
    const requestData = await req.json();
    const { 
      fileUrl, 
      fileName, 
      fileType,
      systemPrompt,
      maxTokens = 1500,
      temperature = 0.1
    } = requestData;

    console.log('Request data:', { fileName, fileType });

    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY environment variable not set');
      return new Response(JSON.stringify({
        error: "Perplexity API key is not configured",
        errorCode: "api_key_missing"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the file content
    let fileContent;
    try {
      const fileResponse = await fetch(fileUrl);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download file: ${fileResponse.statusText}`);
      }

      // Process based on file type
      if (fileType.includes('image')) {
        // For images, we'll use base64 encoding
        const buffer = await fileResponse.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        fileContent = `[IMAGE DATA: data:${fileType};base64,${base64}]`;
      } else {
        // For text-based files, get the text
        fileContent = await fileResponse.text();
      }
    } catch (fileError) {
      console.error('Error processing file:', fileError);
      return new Response(JSON.stringify({
        error: "Failed to process file",
        errorCode: "file_processing_error",
        message: fileError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default system prompt if not provided
    const finalSystemPrompt = systemPrompt || "You are an expert document analyzer providing concise, helpful feedback on files. Focus on practical, actionable advice specific to the document type.";

    // Create the user prompt
    const userPrompt = `I need you to analyze this ${fileType.includes('image') ? 'image' : 'file'} named "${fileName}".
    
${fileType.includes('image') ? 'The image shows:' : 'Here is the content:'}
    
${fileContent}

Please provide a concise, helpful analysis with specific, actionable feedback. If this is a resume, cover letter, or other career document, focus on key strengths and areas for improvement. If it's an image with text, extract and analyze the relevant content.`;

    try {
      console.log('Sending file analysis request to Perplexity');
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            { role: 'system', content: finalSystemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature,
          max_tokens: maxTokens,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Perplexity API error:', errorData);
        
        // Check for quota exceeded or rate limit errors
        if (response.status === 429 || 
            errorData.error?.type === 'insufficient_quota' || 
            errorData.error?.message?.includes('rate limit')) {
          console.warn('Perplexity API quota or rate limit exceeded');
          
          return new Response(JSON.stringify({ 
            error: "Perplexity API quota or rate limit exceeded",
            errorCode: "rate_limited",
            message: errorData.error?.message || "You've exceeded your current quota or rate limit. Please try again later."
          }), {
            status: 429, // Too Many Requests for rate limit issues
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`Perplexity API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log('Perplexity response received');
      
      if (!data.choices || !data.choices[0]) {
        console.error('Unexpected Perplexity response format:', data);
        throw new Error('Invalid response from Perplexity');
      }
      
      const analysis = data.choices[0].message.content;

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (perplexityError) {
      console.error('Perplexity API request error:', perplexityError);
      
      // Check if it's a quota or rate limit error
      if (perplexityError.message?.includes('rate limit') || 
          perplexityError.message?.includes('quota')) {
        console.warn('Perplexity API rate limited from caught error');
        
        return new Response(JSON.stringify({ 
          error: "Perplexity API rate limited",
          errorCode: "rate_limited",
          message: perplexityError.message || "Rate limit or quota exceeded. Please try again later."
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw perplexityError;
    }
  } catch (error) {
    console.error('Error in perplexity-analyze-file function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to analyze file',
      errorCode: "internal_error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
