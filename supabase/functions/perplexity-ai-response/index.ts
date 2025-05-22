
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
    console.log('Perplexity AI response function called');
    const requestData = await req.json();
    const { 
      prompt, 
      type = "general",
      systemPrompt,
      maxTokens = 1000,
      temperature = 0.2
    } = requestData;

    console.log('Incoming prompt:', prompt); // Log the full prompt
    console.log('Request data:', { 
      promptLength: prompt?.length || 0, 
      type,
      maxTokens,
      temperature
    });

    // Use provided system prompt or create default one
    let finalSystemPrompt = systemPrompt || 'You are an AI career advisor that helps users with career guidance, resume optimization, and interview preparation.';
    
    // Default system prompts based on type if not provided
    if (!systemPrompt) {
      if (type === "resume") {
        finalSystemPrompt = 'You are a friendly resume consultant. Help users create effective resumes. Be concise, specific, and constructive. Focus on practical advice tailored to modern hiring practices. Break down complex concepts into simple steps.';
      } else if (type === "interview_prep") {
        finalSystemPrompt = 'You are a supportive interview coach. Provide concise, practical advice for interview preparation. Focus on building confidence and authentic responses. Use examples to illustrate effective answers.';
      } else if (type === "linkedin") {
        finalSystemPrompt = 'You are a LinkedIn profile optimization expert. Provide specific, actionable advice for improving online professional presence. Focus on creating compelling profiles that attract recruiters.';
      } else if (type === "cover_letter") {
        finalSystemPrompt = 'You are a cover letter specialist. Help users create compelling, tailored cover letters. Focus on connecting their experience to specific roles. Be concise and practical.';
      } else if (type === "assessment") {
        finalSystemPrompt = 'You are an assessment preparation coach. Help users prepare for job assessments and tests. Provide practical strategies, sample questions, and preparation techniques.';
      }
    }

    console.log('Using system prompt:', finalSystemPrompt.substring(0, 50) + '...');
    
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
    
    try {
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
            { role: 'user', content: prompt }
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
      console.log('Raw Perplexity API success response:', data); // Log the full raw success response
      console.log('Perplexity response received');
      
      if (!data.choices || !data.choices[0]) {
        console.error('Unexpected Perplexity response format:', data);
        throw new Error('Invalid response from Perplexity');
      }
      
      const aiOutputString = data.choices[0].message.content;
      let responsePayload;

      try {
        const parsedOutput = JSON.parse(aiOutputString);
        if (typeof parsedOutput.generatedText === 'string' && Array.isArray(parsedOutput.sourceUrls)) {
          // Validate that sourceUrls contains only strings, if not empty
          const allUrlsAreStrings = parsedOutput.sourceUrls.every((url: unknown) => typeof url === 'string');
          if (allUrlsAreStrings) {
            responsePayload = {
              generatedText: parsedOutput.generatedText,
              sourceUrls: parsedOutput.sourceUrls,
            };
            console.log('Successfully parsed AI output as JSON with expected fields.');
          } else {
            console.warn('Perplexity response parsed as JSON, but sourceUrls array contains non-string elements. Original output:', aiOutputString);
            responsePayload = { generatedText: aiOutputString, sourceUrls: [] };
          }
        } else {
          console.warn('Perplexity response parsed as JSON, but did not contain expected fields (generatedText: string, sourceUrls: array). Original output:', aiOutputString);
          responsePayload = { generatedText: aiOutputString, sourceUrls: [] };
        }
      } catch (e) {
        console.warn('Perplexity response was not in the expected JSON format. Treating as plain text. Error:', e.message, 'Original output:', aiOutputString);
        responsePayload = { generatedText: aiOutputString, sourceUrls: [] };
      }

      return new Response(JSON.stringify(responsePayload), {
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
    console.error('Error in perplexity-ai-response function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate AI response',
      errorCode: "internal_error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
