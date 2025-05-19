
import { getTemplateFallbackResponse } from "../api/messageUtils";
import { ConversationType } from "../types/conversationTypes";

/**
 * Get file analysis fallback response based on file type
 */
export const getFileAnalysisFallback = (fileName: string, fileType: string): string => {
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
    return "I notice you've uploaded an image file. While I can't analyze it directly right now, here are some general tips for images in professional contexts:\n\n- For profile photos: ensure good lighting, a neutral background, and professional attire\n- For portfolio images: make sure they clearly showcase your work with good resolution\n- For documents saved as images: consider converting to PDF format for better readability\n\nFor more specific feedback, please try again later when our image analysis service is available.";
  } else if (fileExtension === 'pdf') {
    return "I notice you've uploaded a PDF document. While I can't analyze it directly right now, here are some general tips for professional PDFs:\n\n- Ensure consistent formatting throughout the document\n- Use clear section headings to improve readability\n- Include keywords relevant to your industry or target position\n- Keep resume PDFs to 1-2 pages maximum\n- Make sure all links are functional if it's a digital document\n\nFor more specific feedback, please try again later.";
  } else if (['doc', 'docx'].includes(fileExtension)) {
    return "I notice you've uploaded a Word document. While I can't analyze its content directly right now, here are some general tips for professional documents:\n\n- Use consistent formatting with standard fonts (Arial, Calibri, Times New Roman)\n- Include clear section headers\n- For resumes and CVs, focus on achievements rather than just responsibilities\n- Use bullet points for better readability\n- Check spelling and grammar thoroughly before finalizing\n\nFor more specific feedback, please try again later.";
  }
  
  return "I notice you've uploaded a file. While I can't analyze its content directly right now, here are some general tips for professional documents:\n\n- Ensure the document has a clear purpose and audience\n- Use consistent formatting throughout\n- Include relevant keywords for your industry\n- Focus on achievements and measurable results\n- Proofread carefully before sharing\n\nFor more specific feedback, please try again later.";
};

/**
 * Get template fallback response for when AI services fail
 */
export const getFallbackResponse = (prompt: string, type: string): string => {
  return getTemplateFallbackResponse(prompt, type as ConversationType);
};
