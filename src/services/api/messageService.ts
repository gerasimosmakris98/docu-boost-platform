
import { supabase } from "@/integrations/supabase/client";
import { Message, ConversationType } from "../types/conversationTypes";
import { asConversationType } from "./conversationApiUtils";
import { toast } from "sonner";
import { aiProviderService } from "../ai/aiProviderService";
import { buildUserContext, generateContextualPrompt } from "../utils/contextBuilder";
import { getSystemPrompt } from "../utils/conversationUtils";
import { extractUrls } from "../utils/conversationUtils";

/**
 * Send a message to the conversation and get an AI response
 */
export const sendMessage = async (
  conversationId: string, 
  content: string,
  attachments: string[] = []
): Promise<{ aiResponse: Message } | null> => {
  console.log(`sendMessage called for conversationId: ${conversationId}`);
  try {
    // Get conversation data to determine the type
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (convError) {
      console.error('Error fetching conversation details:', convError);
      toast.error("Couldn't load conversation details"); // Updated toast
      throw convError;
    }
    
    const conversationType = asConversationType(conversationData.type);
    const userId = conversationData.user_id;
    console.log(`Sending message for conversation type: ${conversationType}`);
    
    // Insert user message
    const { data: userMessageData, error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
        attachments: attachments || []
      })
      .select()
      .single();

    if (userMessageError) {
      console.error('Error saving user message to database:', userMessageError);
      toast.error("Couldn't save your message");
      throw userMessageError;
    }
    
    console.log('User message saved successfully to DB:', userMessageData.id);
    
    // Build comprehensive user context
    const userContext = await buildUserContext(userId, conversationId, conversationType);
    console.log('User context built:', { 
      hasProfile: !!userContext.profileInfo, 
      hasHistory: !!userContext.conversationHistory,
      type: userContext.conversationType 
    });

    // Get system prompt for the conversation type
    const systemPrompt = getSystemPrompt(conversationType);
    
    // Generate contextual prompt
    const enhancedPrompt = generateContextualPrompt(content, userContext, systemPrompt);
    
    let aiResponseContent = '';
    let sourceUrls: string[] = [];
    
    // Handle file attachments
    if (attachments && attachments.length > 0) {
      console.log('Processing attachments:', attachments);
      const fileUrl = attachments[0];
      const fileName = fileUrl.split('/').pop() || 'file';
      // Basic file type detection (can be expanded)
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      let fileType = 'application/octet-stream'; // Default
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) fileType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      else if (fileExtension === 'pdf') fileType = 'application/pdf';
      else if (['doc', 'docx'].includes(fileExtension)) fileType = 'application/msword';

      try {
        aiResponseContent = await aiProviderService.analyzeFile(fileUrl, fileName, fileType, enhancedPrompt);
        console.log('File analysis complete by AI provider.');
      } catch (fileError) {
        console.error('AI Provider: Error analyzing file:', fileError);
        aiResponseContent = "I couldn't analyze the file you provided. Please ensure it's a supported format and try again.";
        sourceUrls = [];
      }
    } else {
      const urlsInContent = extractUrls(content);
      if (urlsInContent.length > 0) {
        const urlToAnalyze = urlsInContent[0];
        console.log('Analyzing URL with AI provider:', urlToAnalyze);
        try {
          aiResponseContent = await aiProviderService.analyzeUrl(urlToAnalyze, 'webpage', enhancedPrompt);
          console.log('URL analysis complete by AI provider.');
        } catch (urlError) {
          console.error('AI Provider: Error analyzing URL:', urlError);
          aiResponseContent = "I encountered an issue processing the URL. Please check the URL and try again.";
          sourceUrls = [];
        }
      } else {
        console.log('Generating standard AI response with AI provider.');
        try {
          const structuredResponse = await aiProviderService.generateStructuredResponse(
            enhancedPrompt, 
            conversationType,
            { maxTokens: 300, brief: content.trim().split(' ').length < 10 } // Example: brief for short inputs
          );
          if (typeof structuredResponse.generatedText === 'string' && structuredResponse.generatedText.trim() !== '') {
            aiResponseContent = structuredResponse.generatedText;
            sourceUrls = structuredResponse.sourceUrls || [];
            console.log('AI response generated successfully by AI provider.');
          } else {
            console.error('AI Provider: generateStructuredResponse returned invalid or empty text.');
            aiResponseContent = "I'm having trouble generating a response right now. Please try again later.";
            sourceUrls = [];
          }
        } catch (responseError) {
          console.error('AI Provider: Error generating structured response:', responseError);
          aiResponseContent = "I'm currently unable to generate a response. Please try again soon.";
          sourceUrls = [];
        }
      }
    }

    // Validate AI response content before saving
    if (!aiResponseContent || typeof aiResponseContent !== 'string' || aiResponseContent.trim() === '') {
      console.error('Invalid AI response: content is missing, not a string, or empty after processing attempts.', {aiResponseContent});
      toast.error("Invalid AI response received from provider"); // User-friendly toast
      throw new Error("Invalid AI response content from provider");
    }
    
    // Insert AI response
    const { data: aiMessageData, error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiResponseContent,
        source_urls: sourceUrls || [],
        attachments: []
      })
      .select('*, source_urls')
      .single();

    if (aiMessageError) {
      console.error('Error saving AI response to database:', aiMessageError);
      toast.error("Couldn't save AI response");
      throw aiMessageError;
    }
    
    console.log('AI response saved successfully to DB:', aiMessageData.id);

    // Non-critical: Generate and update conversation title
    if (conversationData.title === "New Conversation") {
      try {
        console.log("Attempting to generate title for conversation:", conversationId);
        const { data: allMessagesForTitle, error: messagesError } = await supabase
          .from('messages')
          .select('role, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error("Title Generation: Error fetching messages:", messagesError);
          // Don't throw, just log and proceed to update timestamp
        }
        
        if (allMessagesForTitle && allMessagesForTitle.length >= 2) {
          const generatedTitle = await aiProviderService.generateTitle(allMessagesForTitle);
          if (generatedTitle && generatedTitle.trim() !== "" && generatedTitle !== "New Conversation") {
            await supabase
              .from('conversations')
              .update({ title: generatedTitle, updated_at: new Date().toISOString() })
              .eq('id', conversationId);
            console.log('Conversation title updated to:', generatedTitle);
          } else {
            console.log("Title generation did not produce a new title, or title was empty. Updating timestamp only.");
            await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
          }
        } else {
          // Not enough messages or messages couldn't be fetched, just update timestamp
          console.log("Title Generation: Not enough messages to generate title or messages could not be fetched. Updating timestamp.");
          await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
        }
      } catch (titleError) {
        console.error('Non-critical error during title generation process:', titleError);
        // Ensure timestamp is updated even if title generation itself fails
        try {
          await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
          console.log("Timestamp updated after title generation error.");
        } catch (updateError) {
          console.error("Failed to update timestamp after title generation error:", updateError);
        }
      }
    } else {
      // If title is not "New Conversation", just update the timestamp
      try {
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
        console.log("Conversation timestamp updated for existing title.");
      } catch (updateError) {
        console.error("Failed to update timestamp for existing title conversation:", updateError);
      }
    }

    const aiResponse: Message = {
      id: aiMessageData.id, // Ensure this is correctly assigned
      conversation_id: aiMessageData.conversation_id,
      role: 'assistant',
      content: aiMessageData.content, // This is the validated aiResponseContent
      created_at: aiMessageData.created_at,
      attachments: [], // AI response typically doesn't have attachments from user
      sourceUrls: aiMessageData.source_urls || [] // Ensure this comes from DB record
    };

    return { aiResponse };
  } catch (error) {
    // Main catch block for critical errors
    console.error('Critical error in sendMessage:', error);
    // The toast for specific errors (DB, AI response validation) would have been shown.
    // This is a fallback toast.
    if (!(error instanceof Error && error.message.includes("Invalid AI response content"))) {
         // Avoid double-toasting if it's the invalid AI content error
        toast.error("An unexpected error occurred while sending your message.");
    }
    return null;
  }
};
