
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
  options: { brief?: boolean; depth?: 'low' | 'medium' | 'high'; format?: 'paragraph' | 'bullets' | 'markdown' | 'code' }
): string => {
  const { brief = false, depth = 'medium', format = 'paragraph' } = options;
  
  // Base prompt that works for all types
  let prompt = `
    User message: ${message}
    
    ${context ? `Previous conversation context:\n${context}\n\n` : ''}
    
    Please provide a ${brief ? 'brief' : 'detailed'} response with ${depth} level of detail.
    Format your response as ${format}.
  `;
  
  // Add type-specific instructions
  switch (type) {
    case 'resume':
      prompt += `
        Focus on resume optimization, ATS compatibility, and highlighting relevant experience.
        Provide specific, actionable feedback and suggestions for improvement.
      `;
      break;
    case 'cover_letter':
      prompt += `
        Focus on personalizing the cover letter, connecting the candidate's experience with the job requirements,
        and creating a compelling narrative. Suggest specific improvements or examples.
      `;
      break;
    case 'interview_prep':
      prompt += `
        Provide interview preparation guidance, example answers to likely questions,
        and strategies for communicating effectively. Include specific tips for the user's industry or role.
      `;
      break;
    case 'job_search':
      prompt += `
        Offer job search strategies, tips for finding opportunities, networking advice,
        and suggestions for standing out as a candidate. Be specific to the user's field and goals.
      `;
      break;
    case 'linkedin':
      prompt += `
        Focus on LinkedIn profile optimization, network building, content strategy,
        and using LinkedIn effectively for job searching. Provide specific, actionable advice.
      `;
      break;
    default:
      prompt += `
        Provide career guidance and advice based on the user's question. Be helpful, specific, and actionable.
      `;
  }
  
  return prompt;
};
