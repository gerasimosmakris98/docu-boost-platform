
import { ConversationType } from "../types/conversationTypes";

// Get appropriate prompt based on conversation type
export const getChatPromptForType = (type: ConversationType, documentContent?: string, jobDescription?: string): string => {
  switch (type) {
    case 'resume':
      return `You are a resume specialist. Here's a resume: "${documentContent}". Please provide detailed feedback.`;
    case 'interview_prep':
      return `You are an interview coach. The job description is: "${jobDescription}". Provide interview preparation guidance.`;
    case 'cover_letter':
      return `You are a cover letter expert. Here's a job description: "${jobDescription}". Please help craft an impressive cover letter.`;
    case 'job_search':
      return `You are a job search strategist. Provide detailed advice for finding and applying to jobs effectively.`;
    case 'linkedin':
      return `You are a LinkedIn profile optimization expert. Please help improve this LinkedIn profile for better visibility and impact.`;
    default:
      return 'You are a helpful career assistant. How can I help you with your career goals today?';
  }
};

// Get welcome message based on conversation type
export const getWelcomeMessageForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "Welcome to the Resume Builder! I'm here to help you create a professional, effective resume. To get started, you can:\n\n• Tell me about your work experience\n• Upload an existing resume for me to improve\n• Share a job description to target your resume\n• Ask for specific resume advice\n\nHow would you like to begin?";
    case 'cover_letter':
      return "Welcome to the Cover Letter Assistant! I'll help you craft a compelling cover letter that stands out. To get started, you can:\n\n• Share the job posting you're applying for\n• Tell me about your key qualifications\n• Ask for help with specific sections\n• Get feedback on an existing cover letter\n\nWhat would you like help with today?";
    case 'interview_prep':
      return "Welcome to Interview Preparation! I'll help you prepare for your upcoming interviews. To get started, you can:\n\n• Tell me what position you're interviewing for\n• Practice answering common interview questions\n• Get feedback on your responses\n• Ask for tips on specific interview scenarios\n\nHow would you like to begin your preparation?";
    case 'job_search':
      return "Welcome to Job Search Strategy! I'll help you find and apply for positions that match your skills and career goals. We can:\n\n• Identify target companies and roles\n• Develop application strategies\n• Optimize your job search process\n• Prepare for different application stages\n\nHow would you like to start?";
    case 'linkedin':
      return "Welcome to LinkedIn Optimization! I'll help you create a profile that attracts recruiters and showcases your professional brand. We can:\n\n• Review your current profile\n• Enhance your headline and summary\n• Improve your experience descriptions\n• Optimize for keywords in your industry\n\nWhat aspect of your LinkedIn profile would you like to work on first?";
    default:
      return "Hello! I'm your career AI assistant. I can help with resumes, cover letters, interview preparation, and general career advice. What would you like assistance with today?";
  }
};
