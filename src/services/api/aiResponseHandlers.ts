
import { supabase } from "@/integrations/supabase/client";
import { ConversationType } from "../types/conversationTypes";
import { openaiService } from "../openaiService";
import { getChatPromptForType } from "../utils/conversationUtils";
import { getTemplateFallbackResponse } from "./messageUtils";

/**
 * Get an AI response with fallback handling
 */
export const getAiResponse = async (
  conversationType: ConversationType,
  userMessage: string,
  contextMessages: string,
  attachments: string[] = []
): Promise<string> => {
  try {
    // Create prompt based on conversation type and include context
    const prompt = getChatPromptForType(conversationType, userMessage, contextMessages);
    
    let aiResponseContent = '';
    
    // Handle file attachments if present
    if (attachments && attachments.length > 0) {
      console.log('Processing attachments:', attachments);
      // For simplicity, we'll just analyze the first attachment
      const fileUrl = attachments[0];
      const fileName = fileUrl.split('/').pop() || 'file';
      // Determine file type from URL/name
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
        // Analyze file with OpenAI
        aiResponseContent = await openaiService.analyzeFile(fileUrl, fileName, fileType);
        console.log('File analysis complete');
      } catch (fileError: any) {
        console.error('Error analyzing file:', fileError);
        // Use fallback for file analysis errors
        if (fileError.message?.includes('quota') || fileError.message?.includes('insufficient_quota')) {
          aiResponseContent = `I notice you've uploaded a file (${fileName}). However, I'm currently unable to analyze it due to API quota limitations. Here are some general tips about ${fileExtension} files:\n\n${getFileFallbackResponse(fileExtension)}`;
        } else {
          aiResponseContent = `I couldn't analyze the file you provided. ${fileError.message || 'Please try again with a different file or format.'}`;
        }
      }
    } else {
      // Generate AI response based on text prompt using openai service
      console.log('Generating AI response using OpenAI service');
      try {
        aiResponseContent = await openaiService.generateResponse(prompt, conversationType);
        console.log('AI response generated successfully');
      } catch (error: any) {
        console.error('Error generating AI response:', error);
        // Check if it's a quota error
        if (error.message?.includes('quota') || error.message?.includes('insufficient_quota')) {
          console.log('Using fallback template response due to quota issue');
          aiResponseContent = getTemplateFallbackResponse(userMessage, conversationType);
        } else {
          aiResponseContent = `I apologize, but I encountered an error while generating a response. ${error.message || 'Please try again later.'}`;
        }
      }
    }
    
    return aiResponseContent;
  } catch (error) {
    console.error('Error in getAiResponse:', error);
    return "I apologize, but I encountered an error while processing your request. Please try again later.";
  }
};

/**
 * Get a fallback response for file analysis based on file type
 */
const getFileFallbackResponse = (fileExtension: string): string => {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
    return "When analyzing images for career purposes, I typically look for clarity, professionalism, and appropriateness for your industry. Make sure your image has good lighting, a neutral background, and presents you in professional attire if it's a headshot.";
  } else if (fileExtension === 'pdf') {
    return "When reviewing PDF documents like resumes or cover letters, I look for clear formatting, consistent styling, appropriate length (1-2 pages for resumes), strong accomplishment statements, and relevant keywords for your target industry.";
  } else if (['doc', 'docx'].includes(fileExtension)) {
    return "When reviewing Word documents like resumes or cover letters, I check for professional formatting, clear section headings, bullet points highlighting achievements (not just duties), relevant keywords, and proper grammar and spelling.";
  }
  return "When analyzing files, I typically look for clear organization, relevant content, and proper formatting appropriate to the document type and your industry standards.";
};
