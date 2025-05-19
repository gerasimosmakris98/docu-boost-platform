
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

    console.log('Request data:', { prompt, type });

    // Different system prompts based on the type of request
    let systemPrompt = 'You are an AI career advisor that helps users with career guidance, resume optimization, and interview preparation.';
    
    if (type === "resume_optimization") {
      systemPrompt = 'You are an expert resume consultant that specializes in optimizing resumes for applicant tracking systems and hiring managers. Provide detailed, specific feedback and suggestions.';
    } else if (type === "interview_prep") {
      systemPrompt = 'You are an expert interview coach that helps professionals prepare for job interviews. Provide detailed, actionable advice for answering questions and presenting yourself professionally.';
    } else if (type === "linkedin_analysis") {
      systemPrompt = 'You are a LinkedIn profile optimization expert that helps professionals improve their LinkedIn presence. Analyze the provided profile data and offer specific suggestions for improvement.';
    } else if (type === "job_application") {
      systemPrompt = 'You are a job application strategist that helps professionals apply for jobs effectively. Provide tailored advice on cover letters, application materials, and application strategies.';
    }

    console.log('Using system prompt:', systemPrompt);
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
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
  } catch (error) {
    console.error('Error in generate-ai-response function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to generate AI response' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
