
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
    format?: 'paragraph' | 'bullets' | 'markdown' | 'code';
    maxLength?: number;
    focusedResponse?: boolean;
  }
): string => {
  const { brief = false, depth = 'medium', format = 'paragraph' } = options;
  
  // Base prompt that works for all types
  let prompt = `
    User message: ${message}
    
    ${context ? `Previous conversation context:\n${context}\n\n` : ''}
    
    Please provide a ${brief ? 'brief' : 'detailed'} response with ${depth} level of detail.
    Format your response as ${format}.
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

/**
 * Get welcome message for different conversation types
 */
export const getWelcomeMessageForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "Welcome to Resume Review! I'm here to help optimize your resume. You can upload your resume for review, or we can start working on it from scratch. What would you like to do today?";
    
    case 'cover_letter':
      return "Welcome to Cover Letter Assistant! I'll help you craft a compelling cover letter that showcases your qualifications and personality. Would you like to start with a template or create a custom cover letter for a specific position?";
    
    case 'interview_prep':
      return "Welcome to Interview Preparation! I'll help you prepare for your upcoming interviews with practice questions, tips, and strategies. What type of role are you interviewing for?";
    
    case 'job_search':
      return "Welcome to Job Search Strategy! I'll help you develop an effective job search plan, find relevant opportunities, and stand out from other candidates. Where are you in your job search journey?";
    
    case 'linkedin':
      return "Welcome to LinkedIn Profile Optimization! I'll help you enhance your LinkedIn presence to attract recruiters and showcase your professional brand. Would you like to share your current profile for review?";
    
    case 'assessment':
      return "Welcome to Assessment Preparation! I'll help you prepare for job assessments and tests with practice questions and strategies. What type of assessment are you preparing for?";
    
    default:
      return "Hello! I'm your AI Career Assistant. I can help with resume reviews, cover letters, interview preparation, job search strategies, and more. How can I assist you today?";
  }
};

