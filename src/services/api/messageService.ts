
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
      console.error('Error fetching conversation:', convError);
      toast.error("Couldn't load conversation");
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
      console.error('Error saving user message:', userMessageError);
      toast.error("Couldn't save your message");
      throw userMessageError;
    }
    
    console.log('User message saved successfully:', userMessageData.id);
    
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
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
      let fileType = 'application/octet-stream';
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
        fileType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
      } else if (fileExtension === 'pdf') {
        fileType = 'application/pdf';
      } else if (['doc', 'docx'].includes(fileExtension)) {
        fileType = 'application/msword';
      }
      
      try {
        aiResponseContent = await aiProviderService.analyzeFile(
          fileUrl, 
          fileName, 
          fileType,
          enhancedPrompt
        );
        console.log('File analysis complete');
      } catch (fileError) {
        console.error('Error analyzing file:', fileError);
        aiResponseContent = `I couldn't analyze the file you provided. Please try again with a different file or format.`;
      }
    } else {
      // Check for URLs in the message
      const urls = extractUrls(content);
      
      if (urls.length > 0) {
        // Handle URL analysis
        const urlToAnalyze = urls[0];
        console.log('Analyzing URL:', urlToAnalyze);
        
        try {
          aiResponseContent = await aiProviderService.analyzeUrl(urlToAnalyze, 'webpage', enhancedPrompt);
          console.log('URL analysis complete');
        } catch (urlError) {
          console.error('Error analyzing URL:', urlError);
          // Fall back to regular response
          const structuredResponse = await aiProviderService.generateStructuredResponse(
            enhancedPrompt, 
            conversationType,
            { maxTokens: 300, brief: false }
          );
          aiResponseContent = structuredResponse.generatedText;
          sourceUrls = structuredResponse.sourceUrls;
        }
      } else {
        // Generate regular AI response with context
        console.log('Generating contextual AI response');
        const structuredResponse = await aiProviderService.generateStructuredResponse(
          enhancedPrompt, 
          conversationType,
          { maxTokens: 300, brief: content.trim().split(' ').length < 10 }
        );
        aiResponseContent = structuredResponse.generatedText;
        sourceUrls = structuredResponse.sourceUrls;
        console.log('AI response generated successfully');
      }
    }

    if (!aiResponseContent || typeof aiResponseContent !== 'string') {
      console.error('Invalid AI response: generatedText is missing or not a string');
      throw new Error("Invalid AI response content");
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
      console.error('Error saving AI response:', aiMessageError);
      toast.error("Couldn't save AI response");
      throw aiMessageError;
    }
    
    console.log('AI response saved successfully');

    // Generate a title for the conversation if it's currently "New Conversation"
    if (conversationData.title === "New Conversation") {
      try {
        // Get all messages for title generation
        const { data: allMessages } = await supabase
          .from('messages')
          .select('role, content')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });
        
        if (allMessages && allMessages.length >= 2) {
          const generatedTitle = await aiProviderService.generateTitle(allMessages);
          
          if (generatedTitle && generatedTitle !== "New Conversation") {
            await supabase
              .from('conversations')
              .update({ 
                title: generatedTitle,
                updated_at: new Date().toISOString() 
              })
              .eq('id', conversationId);
            console.log('Conversation title updated to:', generatedTitle);
          } else {
            // Just update the timestamp
            await supabase
              .from('conversations')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', conversationId);
          }
        }
      } catch (titleError) {
        console.error('Error generating title:', titleError);
        // Still update the timestamp even if title generation fails
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    } else {
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    const aiResponse: Message = {
      id: aiMessageData.id,
      conversation_id: aiMessageData.conversation_id,
      role: 'assistant',
      content: aiMessageData.content,
      created_at: aiMessageData.created_at,
      sourceUrls: aiMessageData.source_urls || []
    };

    return { aiResponse };
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error("Failed to get AI response");
    return null;
  }
};
