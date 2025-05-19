
import { ConversationType } from "../types/conversationTypes";
import { ProgressiveResponseOptions } from "../ai/types";

/**
 * Get a welcome message for a conversation type
 * @param type Conversation type
 * @returns Welcome message text
 */
export const getWelcomeMessageForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "Hi! I'm your Resume Assistant. I can help you create or improve your resume. How would you like to start?\n\n• Review your existing resume\n• Create a new resume from scratch\n• Target your resume for a specific job\n• Get quick resume tips";
    case 'interview_prep':
      return "Hi! I'm your Interview Coach. What type of interview are you preparing for? I can help with:\n\n• Practice questions for your industry\n• Feedback on your responses\n• Strategies for different interview formats\n• Quick tips for your upcoming interview";
    case 'cover_letter':
      return "Hi! I'm your Cover Letter Assistant. How can I help today?\n\n• Draft a new cover letter\n• Review your existing letter\n• Tailor your letter to a job posting\n• Get quick cover letter tips";
    case 'job_search':
      return "Hi! I'm your Job Search Strategist. How can I help you today?\n\n• Find relevant job opportunities\n• Optimize your application strategy\n• Network more effectively\n• Prepare for the application process";
    case 'linkedin':
      return "Hi! I'm your LinkedIn Profile Expert. How can I help optimize your professional presence?\n\n• Review your current profile\n• Improve specific sections\n• Enhance your visibility to recruiters\n• Get quick LinkedIn tips";
    case 'assessment':
      return "Hi! I'm your Assessment Coach. What kind of pre-employment test are you preparing for? I can help with:\n\n• Practice questions\n• Test-taking strategies\n• Understanding assessment formats\n• Quick tips for success";
    default:
      return "Hello! I'm your Career AI Assistant. How can I help you today? I can provide guidance on resumes, interviews, cover letters, job searches, and more.";
  }
};

/**
 * Generate a chat prompt based on conversation type
 * @param type Conversation type
 * @param userMessage The current user message
 * @param context Previous messages for context
 * @param options Progressive response options
 * @returns Formatted prompt for the AI
 */
export const getChatPromptForType = (
  type: ConversationType, 
  userMessage: string,
  context?: string,
  options?: Partial<ProgressiveResponseOptions>
): string => {
  // Base prompt with context if available
  const contextPrefix = context ? `Previous conversation:\n${context}\n\nCurrent message: ` : '';
  const basePrompt = `${contextPrefix}${userMessage}`;
  
  // Default response options
  const responseOptions: ProgressiveResponseOptions = {
    brief: options?.brief ?? true,
    depth: options?.depth ?? 'medium',
    format: options?.format ?? 'steps',
    ...options
  };
  
  // Response guidance based on options
  const responseLengthGuidance = responseOptions.brief ? 
    "Keep your initial response concise (under 250 words). Offer to provide more details if the user wants to explore further." : 
    "Provide a comprehensive response that thoroughly addresses the user's needs.";
  
  const responseFormatGuidance = responseOptions.format === 'steps' ?
    "Structure your response as clear, numbered steps when providing instructions or processes." :
    responseOptions.format === 'bullets' ?
    "Use bullet points to organize your response for clarity and readability." :
    "Use concise paragraphs to explain concepts clearly.";
  
  // Common instructions for all advisor types
  const commonInstructions = `
${responseLengthGuidance} ${responseFormatGuidance} Be conversational and friendly. Ask clarifying questions when needed. If analyzing a URL or file, focus on providing actionable insights rather than just summarizing the content.
`;
  
  // Specialized prompts for different conversation types
  switch (type) {
    case 'resume':
      return `${basePrompt}\n\nYou are a friendly resume advisor. Focus on practical, specific advice for creating an effective resume. ${commonInstructions} Prioritize ATS optimization, relevant achievements, and industry-appropriate formatting.`;
    
    case 'interview_prep':
      return `${basePrompt}\n\nYou are a supportive interview coach. ${commonInstructions} Provide specific examples and tailored advice for interview questions. Focus on helping the user develop authentic, effective responses that highlight their strengths.`;
    
    case 'cover_letter':
      return `${basePrompt}\n\nYou are a helpful cover letter specialist. ${commonInstructions} Focus on helping the user create a compelling narrative that connects their experience to the specific role they're applying for. Emphasize authenticity and relevance.`;
    
    case 'job_search':
      return `${basePrompt}\n\nYou are a strategic job search advisor. ${commonInstructions} Provide practical, actionable job search advice tailored to the user's field and career stage. Focus on effective strategies for finding and securing opportunities.`;
    
    case 'linkedin':
      return `${basePrompt}\n\nYou are a LinkedIn optimization expert. ${commonInstructions} Give specific advice for improving LinkedIn profiles to attract recruiters and opportunities. Focus on professional branding and strategic networking.`;
    
    case 'assessment':
      return `${basePrompt}\n\nYou are an assessment preparation coach. ${commonInstructions} Provide focused guidance on preparing for job assessments, understanding test formats, and demonstrating skills effectively. Include practice examples when helpful.`;
    
    default:
      return `${basePrompt}\n\nYou are a helpful career advisor. ${commonInstructions} Provide tailored guidance based on the user's specific career situation and goals.`;
  }
};

/**
 * Format conversation context from previous messages with better readability
 */
export const formatConversationContext = (messages: { role: string; content: string }[]): string => {
  if (!messages || messages.length === 0) return '';
  
  // Only include the last 5 messages for more focused context
  const recentMessages = messages.slice(-5);
  
  return recentMessages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');
};

/**
 * Extract and process URLs from user message
 * Returns the type of URL detected
 */
export const extractUrlType = (url: string): 'linkedin' | 'job' | 'company' | 'assessment' | 'general' => {
  if (!url) return 'general';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('linkedin.com/in/') || lowerUrl.includes('linkedin.com/profile/')) {
    return 'linkedin';
  } else if (lowerUrl.includes('jobs') || lowerUrl.includes('careers') || lowerUrl.includes('position')) {
    return 'job';
  } else if (lowerUrl.includes('test') || lowerUrl.includes('assessment') || lowerUrl.includes('quiz')) {
    return 'assessment';
  } else if (lowerUrl.includes('about') || lowerUrl.includes('company') || lowerUrl.includes('org')) {
    return 'company';
  }
  
  return 'general';
};

/**
 * Create a system prompt for a specific advisor type
 */
export const getSystemPromptForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "You are a friendly, knowledgeable resume advisor. Focus on providing practical, concise advice that helps users create effective resumes for modern job applications. Ask questions to better understand their situation when needed. For any uploaded resumes, provide specific, actionable feedback rather than general principles.";
    
    case 'interview_prep':
      return "You are a supportive interview coach helping users prepare for job interviews. Provide practical advice, sample answers, and constructive feedback. When users practice answers, focus on improving their content and delivery. Be encouraging but honest, and tailor your guidance to their specific industry and role.";
    
    case 'cover_letter':
      return "You are a helpful cover letter specialist who helps users create compelling, personalized cover letters. Focus on helping users connect their experience to specific roles. Provide clear, actionable advice that's tailored to their situation rather than generic principles.";
    
    case 'job_search':
      return "You are a strategic job search advisor who helps users find and secure opportunities. Provide specific, practical guidance on job search strategies, application tactics, and networking approaches. Focus on actionable steps tailored to the user's field and career stage.";
    
    case 'linkedin':
      return "You are a LinkedIn optimization expert who helps users improve their professional online presence. Provide specific, actionable guidance for enhancing LinkedIn profiles to attract recruiters and opportunities. When reviewing profiles, offer concrete suggestions rather than general principles.";
    
    case 'assessment':
      return "You are an assessment preparation coach who helps users prepare for job-related tests and assessments. Provide focused guidance on test formats, preparation strategies, and practice questions. Adjust your advice based on the specific type of assessment they're facing.";
    
    default:
      return "You are a helpful career advisor providing guidance on various career development topics. Your advice should be practical, specific, and tailored to the user's unique situation. Ask clarifying questions when needed, and focus on actionable next steps.";
  }
};
