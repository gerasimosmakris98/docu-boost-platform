import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface FeedbackRequestBody {
  message_id: string;
  conversation_id: string;
  is_positive: boolean;
  feedback_text?: string;
}

serve(async (req: Request) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as FeedbackRequestBody;
    const { message_id, conversation_id, is_positive, feedback_text } = body;

    // Validate required fields
    if (!message_id || !conversation_id || typeof is_positive !== 'boolean') {
      return new Response(JSON.stringify({ error: 'Missing required fields: message_id, conversation_id, and is_positive must be provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create Supabase client with service role key for admin operations
    // Ensure environment variables are set in your Supabase project settings
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key for direct table access
    );
    
    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
        });
    }
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''));

    if (userError || !user) {
      console.error('User retrieval error:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed or user not found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Prepare data for insertion
    const feedbackData = {
      message_id,
      conversation_id,
      user_id: user.id, // Use the authenticated user's ID
      is_positive,
      feedback_text: feedback_text || null, // Handle optional feedback_text
    };

    // Insert feedback into the database
    const { error: insertError } = await supabaseAdmin
      .from('message_feedback')
      .insert(feedbackData);

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      // Check for specific errors, e.g., foreign key constraint
      if (insertError.code === '23503') { // Foreign key violation
          return new Response(JSON.stringify({ error: 'Invalid message_id or conversation_id.' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
          });
      }
      return new Response(JSON.stringify({ error: `Failed to record feedback: ${insertError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Feedback recorded successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (error) {
    console.error('General error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
