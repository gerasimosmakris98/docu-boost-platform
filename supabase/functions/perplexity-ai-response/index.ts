
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
    const { prompt, type = "general" } = requestData;

    console.log('Request data:', { prompt, type });

    // Different system prompts based on the type of request
    let systemPrompt = 'You are an AI career advisor that helps users with career guidance, resume optimization, and interview preparation.';
    
    if (type === "resume" || type === "resume_optimization") {
      systemPrompt = 'You are an expert resume consultant that specializes in optimizing resumes for applicant tracking systems and hiring managers. Provide detailed, specific feedback and suggestions.';
    } else if (type === "interview_prep") {
      systemPrompt = 'You are an expert interview coach that helps professionals prepare for job interviews. Provide detailed, actionable advice for answering questions and presenting yourself professionally.';
    } else if (type === "linkedin" || type === "linkedin_analysis") {
      systemPrompt = 'You are a LinkedIn profile optimization expert that helps professionals improve their LinkedIn presence. Analyze the provided profile data and offer specific suggestions for improvement.';
    } else if (type === "cover_letter" || type === "job_application") {
      systemPrompt = 'You are a job application strategist that helps professionals apply for jobs effectively. Provide tailored advice on cover letters, application materials, and application strategies.';
    }

    console.log('Using system prompt:', systemPrompt);
    
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 1000,
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
      
      const generatedText = data.choices[0].message.content;

      return new Response(JSON.stringify({ generatedText }), {
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
