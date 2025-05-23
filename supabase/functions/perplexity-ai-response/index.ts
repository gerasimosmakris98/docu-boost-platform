
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
    console.log('Perplexity AI response function called'); // This can be removed if redundant with the new Start log
    const requestData = await req.json();
    console.log('--- perplexity-ai-response: Start ---');
    console.log('Raw request body received by Supabase function:', JSON.stringify(requestData, null, 2));
    const { 
      prompt, 
      type = "general",
      systemPrompt,
      maxTokens = 1000,
      temperature // Removed default value here
    } = requestData;

    console.log('Incoming prompt:', prompt); // Log the full prompt
    console.log('Request data:', { 
      promptLength: prompt?.length || 0, 
      type,
      maxTokens,
      temperature
    });

    const CORE_SYSTEM_INSTRUCTIONS = `**Your Persona & Tone**: You are an AI Career Advisor. Your persona is that of a friendly, highly knowledgeable, and empathetic human expert. Your language must be conversational, natural, and engaging. Avoid overly formal or robotic phrasing. Speak directly to the user.

**Interaction Style**:
- Acknowledge user statements briefly and naturally where appropriate to create a smooth dialogue.
- If a user's request is ambiguous, ask clarifying questions.
- Focus on the user's most recent message, but use the conversation history intelligently to avoid repetition and maintain context. Do not repeat information you have already provided or that the user has already stated. Strive for fresh and relevant contributions in each turn.
- Use varied sentence structures and vocabulary.

**Critical Formatting Rules (Output MUST use Markdown)**:
- **Paragraphs**: To create separate paragraphs, you MUST output two newline characters (\\n\\n) between them. Single newlines will not create new paragraphs in the final display.
- **Bullet Points**: Start each bullet point with a hyphen or asterisk followed by a space, and ensure each bullet point is on its own line (ends with \\n). Example: - Point 1\\n- Point 2\\n- Point 3
- **Numbered Lists**: Start each item with a number followed by a period and a space, and ensure each item is on its own line (ends with \\n). Example: 1. Item A\\n2. Item B\\n3. Item C
- Ensure lists are clearly separated from surrounding text by blank lines (i.e., \\n\\n before and after the list block).

**Conciseness & Clarity**: Avoid 'huge texts without a reason'. Be thorough if the topic requires it, but prioritize clarity and conciseness. Break down complex information into smaller, easily digestible paragraphs or appropriately formatted lists.

**Avoid AI Clichés**: Do not start sentences with generic AI phrases like 'As an AI language model...', 'As an AI...', etc. Do not mention that you are an AI unless directly relevant to a limitation.`;

    let finalSystemPrompt = systemPrompt || CORE_SYSTEM_INSTRUCTIONS;
    
    // If systemPrompt is NOT provided by the user, then we might specialize it based on 'type'
    if (!systemPrompt) {
      if (type === "resume") {
        finalSystemPrompt = `${CORE_SYSTEM_INSTRUCTIONS}\n\nYou are a friendly resume consultant. Help users create effective resumes. Be concise, specific, and constructive. Focus on practical advice tailored to modern hiring practices. Break down complex concepts into simple steps.`;
      } else if (type === "interview_prep") {
        finalSystemPrompt = `${CORE_SYSTEM_INSTRUCTIONS}\n\nYou are a supportive interview coach. Provide concise, practical advice for interview preparation. Focus on building confidence and authentic responses. Use examples to illustrate effective answers.`;
      } else if (type === "linkedin") {
        finalSystemPrompt = `${CORE_SYSTEM_INSTRUCTIONS}\n\nYou are a LinkedIn profile optimization expert. Provide specific, actionable advice for improving online professional presence. Focus on creating compelling profiles that attract recruiters.`;
      } else if (type === "cover_letter") {
        finalSystemPrompt = `${CORE_SYSTEM_INSTRUCTIONS}\n\nYou are a cover letter specialist. Help users create compelling, tailored cover letters. Focus on connecting their experience to specific roles. Be concise and practical.`;
      } else if (type === "assessment") {
        finalSystemPrompt = `${CORE_SYSTEM_INSTRUCTIONS}\n\nYou are an assessment preparation coach. Help users prepare for job assessments and tests. Provide practical strategies, sample questions, and preparation techniques.`;
      }
      // If 'type' is 'general' or any other type not listed, finalSystemPrompt remains CORE_SYSTEM_INSTRUCTIONS
    }

    console.log('Using system prompt (first 200 chars):', finalSystemPrompt.substring(0, 200) + '...');
    
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
      const modelForPerplexity = 'llama-3.1-sonar-small-128k-online';
      const actualTemperature = temperature ?? 0.35;
      const topPValue = 0.9;

      const perplexityRequestBody = {
        model: modelForPerplexity,
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: actualTemperature,
        max_tokens: maxTokens,
        top_p: topPValue,
      };
      console.log('Payload being sent to Perplexity API:', JSON.stringify(perplexityRequestBody, null, 2));

      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(perplexityRequestBody), // Use the logged body
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
      
      console.log('--- perplexity-ai-response: End ---');
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
