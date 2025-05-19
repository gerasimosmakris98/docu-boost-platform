
import { ConversationType } from "../types/conversationTypes";

/**
 * Get a welcome message for a conversation type
 * @param type Conversation type
 * @returns Welcome message text
 */
export const getWelcomeMessageForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "Welcome to the Resume Builder! I'm here to help you create a professional, effective resume. To get started, you can:\n\n• Tell me about your work experience\n• Upload an existing resume for me to improve\n• Share a job description to target your resume\n• Ask for specific resume advice\n\nHow would you like to begin?";
    case 'interview_prep':
      return "Welcome to Interview Preparation! I'll help you prepare for your upcoming interviews. To get started, you can:\n\n• Tell me what position you're interviewing for\n• Practice answering common interview questions\n• Get feedback on your responses\n• Ask for tips on specific interview scenarios\n\nHow would you like to begin your preparation?";
    case 'cover_letter':
      return "Welcome to the Cover Letter Assistant! I'll help you craft a compelling cover letter that stands out. To get started, you can:\n\n• Share the job posting you're applying for\n• Tell me about your key qualifications\n• Ask for help with specific sections\n• Get feedback on an existing cover letter\n\nWhat would you like help with today?";
    case 'job_search':
      return "Welcome to Job Search Strategy! I'm here to help you find and apply for the right jobs. Let's work on your job search approach, application strategy, or discuss specific opportunities you're interested in.";
    case 'linkedin':
      return "Welcome to LinkedIn Profile Optimization! I'll help you improve your LinkedIn presence to attract recruiters and opportunities. Upload your current profile or share specific sections you'd like to enhance.";
    case 'assessment':
      return "Welcome to Assessment Preparation! I'll help you prepare for job assessments, coding challenges, or other pre-employment tests. What type of assessment are you preparing for?";
    default:
      return "Hello! I'm your career AI assistant. I can help with resumes, cover letters, interview preparation, and general career advice. What would you like assistance with today?";
  }
};

/**
 * Generate a chat prompt based on conversation type
 * @param type Conversation type
 * @param userMessage The current user message
 * @param context Previous messages for context
 * @returns Formatted prompt for the AI
 */
export const getChatPromptForType = (
  type: ConversationType, 
  userMessage: string,
  context?: string
): string => {
  // Base prompt with context if available
  const contextPrefix = context ? `Previous conversation:\n${context}\n\nCurrent message: ` : '';
  const basePrompt = `${contextPrefix}${userMessage}`;
  
  // Specialized prompts for different conversation types
  switch (type) {
    case 'resume':
      return `${basePrompt}\n\nPlease provide resume advice, focusing on optimizing the resume for ATS systems, highlighting relevant experience, and using industry-specific keywords.`;
    
    case 'interview_prep':
      return `${basePrompt}\n\nProvide interview preparation advice, including specific examples, common questions in this field, and strategies for addressing challenging questions.`;
    
    case 'cover_letter':
      return `${basePrompt}\n\nHelp draft or improve a cover letter that showcases relevant skills and experience while demonstrating enthusiasm for the role and company.`;
    
    case 'job_search':
      return `${basePrompt}\n\nProvide job search strategy advice, including where to find opportunities, how to network effectively, and tips for standing out in the application process.`;
    
    case 'linkedin':
      return `${basePrompt}\n\nOffer LinkedIn profile optimization advice, focusing on creating an impactful headline, summary, and experience sections that attract recruiters.`;
    
    case 'assessment':
      return `${basePrompt}\n\nProvide guidance on preparing for job assessments, including practice questions, strategies for different assessment types, and tips for demonstrating skills effectively.`;
    
    default:
      return basePrompt;
  }
};
