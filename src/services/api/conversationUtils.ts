
import { ConversationType } from "../types/conversationTypes";

/**
 * Format conversation history into a context string
 */
export const formatConversationContext = (messages: { role: string; content: string }[]): string => {
  if (!messages || messages.length === 0) return '';
  
  return messages.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n\n');
};

/**
 * Extract URL type from a URL string
 */
export const extractUrlType = (url: string): string => {
  try {
    // Check if it's a LinkedIn URL
    if (url.includes('linkedin.com')) {
      if (url.includes('/in/')) {
        return 'LinkedIn profile';
      } else if (url.includes('/company/')) {
        return 'LinkedIn company';
      } else if (url.includes('/jobs/')) {
        return 'LinkedIn job';
      }
      return 'LinkedIn page';
    }
    
    // Check if it's a job board
    if (
      url.includes('indeed.com') ||
      url.includes('monster.com') ||
      url.includes('glassdoor.com/job') ||
      url.includes('ziprecruiter.com')
    ) {
      return 'job listing';
    }
    
    // Check if it's a company website
    if (url.includes('careers') || url.includes('jobs') || url.includes('about')) {
      return 'company website';
    }
    
    // Default
    return 'website';
  } catch (error) {
    return 'website';
  }
};

/**
 * Generate a prompt based on conversation type
 */
export const getChatPromptForType = (
  type: ConversationType, 
  message: string, 
  context: string,
  options: { 
    brief?: boolean; 
    depth?: 'low' | 'medium' | 'high'; 
    format?: 'paragraph' | 'bullets' | 'markdown' | 'code' | 'mixed';
    maxLength?: number;
    focusedResponse?: boolean;
    conversational?: boolean;
  }
): string => {
  const { brief = true, depth = 'low', format = 'mixed', conversational = true } = options;
  
  // Base prompt that works for all types - making it more conversational and brief
  let prompt = `
    User message: ${message}
    
    ${context ? `Previous conversation context:\n${context}\n\n` : ''}
    
    Please provide a ${brief ? 'brief' : 'detailed'} response with ${depth} level of detail.
    ${conversational ? 'Be conversational, friendly, and natural in your response. Write like a helpful human, not a formal AI.' : 'Be professional in your response.'}
    
    ${format === 'mixed' 
      ? 'Use a mix of short paragraphs and bullet points for easy readability. Add space between paragraphs.'
      : `Format your response as ${format}.`
    }
  `;
  
  // Add constraints for length if specified
  if (options.maxLength) {
    prompt += `\n    Keep your response concise, ideally under ${options.maxLength} characters.`;
  }
  
  // Add focused response instruction if specified
  if (options.focusedResponse) {
    prompt += `\n    Focus directly on answering the question without unnecessary elaboration.`;
  }
  
  // Add type-specific instructions
  switch (type) {
    case 'resume':
      prompt += `
        Focus on specific, practical resume tips without being too formal.
        Use bullet points for key suggestions.
      `;
      break;
    case 'cover_letter':
      prompt += `
        Offer clear, actionable cover letter advice in a friendly tone.
        Break up long advice into bullet points or numbered steps.
      `;
      break;
    case 'interview_prep':
      prompt += `
        Provide concise interview guidance as if we're having a casual conversation.
        Use bullet points for key interview tips or sample answers.
      `;
      break;
    case 'job_search':
      prompt += `
        Share practical job search suggestions in a supportive, friendly way.
        Use bullet points for listing steps or strategies.
      `;
      break;
    case 'linkedin':
      prompt += `
        Give straightforward LinkedIn advice without being overly formal.
        Use bullet points for optimization tips.
      `;
      break;
    default:
      prompt += `
        Provide helpful career guidance in a friendly, conversational manner.
        Use a mix of paragraphs and bullet points for readability.
      `;
  }
  
  return prompt;
};

/**
 * Get welcome message for different conversation types
 */
export const getWelcomeMessageForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "Hi there! I'm your Resume Advisor. How can I help with your resume today?";
    
    case 'cover_letter':
      return "Hi! I'm your Cover Letter Assistant. Need help crafting a compelling cover letter?";
    
    case 'interview_prep':
      return "Hello! I'm your Interview Coach. What type of interview are you preparing for?";
    
    case 'job_search':
      return "Hi there! I'm your Job Search Advisor. How can I help with your job hunt today?";
    
    case 'linkedin':
      return "Hello! I'm your LinkedIn Profile Coach. How can I help improve your LinkedIn presence?";
    
    case 'assessment':
      return "Hi! I'm your Assessment Coach. What type of assessment are you preparing for?";
    
    default:
      return "Hello! I'm your AI Career Assistant. How can I help with your career today?";
  }
};

/**
 * Validate message content to prevent empty or malformed messages
 */
export const validateMessageContent = (content: string): string => {
  if (!content || content.trim() === '') {
    return 'No content provided.';
  }
  
  // Trim excessive whitespace and limit length if needed
  const trimmedContent = content.trim();
  
  // You can add more validation logic here if needed
  // For example, limiting message length or removing unsafe content
  
  return trimmedContent;
};

