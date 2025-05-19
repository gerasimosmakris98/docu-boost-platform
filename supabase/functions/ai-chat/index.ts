
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { messages, conversationType, attachments } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is missing. Please configure it in Supabase secrets.');
    }

    console.log(`Processing ${conversationType} conversation with ${messages.length} messages`);
    
    // Get the appropriate system prompt based on conversation type
    const systemPrompt = getSystemPromptForType(conversationType, attachments);
    
    // Prepare messages for OpenAI with the system prompt
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(1) // Skip the original system message as we're adding our own
    ];

    console.log(`Sending request to OpenAI with ${formattedMessages.length} messages`);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using more efficient model
        messages: formattedMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Response received from OpenAI');
    
    return new Response(JSON.stringify({ 
      content: data.choices[0].message.content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI chat function:', error);
    
    return new Response(JSON.stringify({ 
      error: `Error processing request: ${error.message}` 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to get system prompts based on conversation type
function getSystemPromptForType(type: string, attachments?: string[]): string {
  let basePrompt = "";
  
  switch(type) {
    case 'resume':
      basePrompt = "You are a professional resume writer and career coach. Help the user create or improve their resume. Provide specific, tailored advice based on their experience and the job they're targeting. Be concise but thorough, and format content in a clean, professional way.";
      break;
    case 'cover_letter':
      basePrompt = "You are an expert at writing compelling cover letters. Help the user create a cover letter that highlights their relevant experience and skills for the specific job they're applying to. Be professional, authentic, and persuasive.";
      break;
    case 'interview_prep':
      basePrompt = "You are an interview coach with expertise in preparing candidates. Help the user prepare for job interviews by providing common questions, strategies for effective answers, and feedback on their practice responses. Be supportive but honest in your assessment.";
      break;
    case 'job_search':
      basePrompt = "You are a job search strategist. Help the user find and apply for jobs that match their skills and interests. Provide advice on optimizing their job search process, networking strategies, and application techniques.";
      break;
    case 'linkedin':
      basePrompt = "You are a LinkedIn optimization expert. Help the user improve their LinkedIn profile to attract recruiters and showcase their professional brand. Provide specific advice on headline, summary, experience descriptions, and engagement strategies.";
      break;
    default:
      basePrompt = "You are a helpful career development assistant. Provide guidance, advice, and support for various career-related questions and needs.";
  }
  
  // If there are attachments, add instructions for handling them
  if (attachments && attachments.length > 0) {
    basePrompt += "\n\nThe user has shared attachments with you. ";
    
    // Check if there might be images
    const possibleImages = attachments.some(url => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    );
    
    // Check if there might be PDFs or documents
    const possibleDocuments = attachments.some(url => 
      /\.(pdf|doc|docx|txt|rtf|odt)$/i.test(url)
    );
    
    if (possibleImages) {
      basePrompt += "These may include images that you should describe and refer to in your response. ";
    }
    
    if (possibleDocuments) {
      basePrompt += "These may include documents such as resumes, cover letters, or job descriptions. Analyze them and provide feedback or suggestions based on their content. ";
    }
    
    basePrompt += "Always acknowledge the attached files in your response.";
  }
  
  return basePrompt;
}
