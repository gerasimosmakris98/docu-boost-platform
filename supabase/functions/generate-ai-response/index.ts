
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    console.log('Generate AI response function called');
    const requestData = await req.json();
    const { prompt, type = "general" } = requestData;

    console.log('Request data:', { type });

    // Different system prompts based on the type of request
    let systemPrompt = 'You are an AI career advisor that helps users with career guidance, resume optimization, and interview preparation.';
    
    if (type === "resume") {
      systemPrompt = 'You are an expert resume consultant that specializes in optimizing resumes for applicant tracking systems and hiring managers. Provide detailed, specific feedback and suggestions.';
    } else if (type === "cover_letter") {
      systemPrompt = 'You are an expert cover letter writer that helps professionals create compelling narratives connecting their experience to job requirements. Provide detailed, actionable advice.';
    } else if (type === "interview_prep") {
      systemPrompt = 'You are an expert interview coach that helps professionals prepare for job interviews. Provide detailed example answers, strategies for difficult questions, and presentation tips.';
    } else if (type === "linkedin") {
      systemPrompt = 'You are a LinkedIn profile optimization expert that helps professionals improve their LinkedIn presence. Analyze profiles and offer specific suggestions for improvement.';
    } else if (type === "job_search") {
      systemPrompt = 'You are a job search strategist that helps professionals find and apply for jobs effectively. Provide advice on job boards, networking, application strategies, and company research.';
    } else if (type === "file_analysis") {
      systemPrompt = 'You are a document analysis expert that reviews files and provides detailed feedback. Analyze the document for content, structure, clarity, and alignment with career goals.';
    } else if (type === "url_analysis") {
      systemPrompt = 'You are a web content analyst that reviews online resources and provides insights. Analyze the content for relevance, quality, and potential applications to career development.';
    }

    console.log('Using system prompt for:', type);
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY environment variable not set');
      return new Response(JSON.stringify({
        error: "OpenAI API key is not configured",
        errorCode: "api_key_missing"
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        
        // Check for quota exceeded error
        if (errorData.error?.code === 'insufficient_quota' || 
            errorData.error?.message?.includes('quota') ||
            errorData.error?.message?.includes('exceeded')) {
          console.warn('OpenAI API quota exceeded');
          
          return new Response(JSON.stringify({ 
            error: "OpenAI API quota exceeded",
            errorCode: "insufficient_quota",
            message: errorData.error?.message || "You've exceeded your current quota. Please check your plan and billing details."
          }), {
            status: 402, // Payment Required is appropriate for quota issues
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log('OpenAI response received');
      
      if (!data.choices || !data.choices[0]) {
        console.error('Unexpected OpenAI response format:', data);
        throw new Error('Invalid response from OpenAI');
      }
      
      const generatedText = data.choices[0].message.content;

      return new Response(JSON.stringify({ generatedText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (openAiError) {
      console.error('OpenAI API request error:', openAiError);
      
      // Check if it's a quota error
      if (openAiError.message?.includes('quota') || 
          openAiError.message?.includes('exceeded') || 
          openAiError.message?.includes('insufficient_quota')) {
        console.warn('OpenAI API quota exceeded from caught error');
        
        return new Response(JSON.stringify({ 
          error: "OpenAI API quota exceeded",
          errorCode: "insufficient_quota",
          message: openAiError.message || "You've exceeded your current quota. Please check your plan and billing details."
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw openAiError;
    }
  } catch (error) {
    console.error('Error in generate-ai-response function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate AI response',
      errorCode: "internal_error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
