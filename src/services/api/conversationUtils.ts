
import { ConversationType } from "../types/conversationTypes";

/**
 * Get a welcome message for a specific conversation type
 */
export const getWelcomeMessageForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "Welcome to the Resume Builder! I'm here to help you create a professional, effective resume. I've noticed you have some profile data already, which I'll use to provide personalized guidance. To get started, you can:\n\n• Tell me about your work experience\n• Upload an existing resume for me to improve\n• Share a job description to target your resume\n• Ask for specific resume advice\n\nHow would you like to begin?";
    case 'cover_letter':
      return "Welcome to the Cover Letter Assistant! I'll help you craft a compelling cover letter that stands out. Based on your profile information, I can provide tailored guidance. To get started, you can:\n\n• Share the job posting you're applying for\n• Tell me about your key qualifications\n• Ask for help with specific sections\n• Get feedback on an existing cover letter\n\nWhat would you like help with today?";
    case 'interview_prep':
      return "Welcome to Interview Preparation! Looking at your profile, I'll help you prepare for interviews with personalized guidance. To get started, you can:\n\n• Tell me what position you're interviewing for\n• Practice answering common interview questions\n• Get feedback on your responses\n• Ask for tips on specific interview scenarios\n\nHow would you like to begin your preparation?";
    case 'linkedin':
      return "Welcome to LinkedIn Profile Optimization! I'll help you enhance your LinkedIn presence based on your current profile data. To get started, you can:\n\n• Ask for feedback on specific sections of your profile\n• Explore strategies to increase your visibility to recruiters\n• Learn how to build your professional network\n• Upload your current LinkedIn profile for a comprehensive review\n\nHow would you like to improve your LinkedIn presence?";
    case 'job_search':
      return "Welcome to Job Search Strategy! Based on your profile information, I'll help you navigate your job search effectively. To get started, you can:\n\n• Tell me about your target roles or industries\n• Ask for help finding job opportunities that match your skills\n• Learn strategies for networking and outreach\n• Get advice on application tracking and follow-up\n\nWhat aspect of your job search would you like to focus on?";
    case 'assessment':
      return "Welcome to Assessment Preparation! I'll help you prepare for assessments and tests with personalized guidance based on your profile. To get started, you can:\n\n• Tell me about the assessment you're preparing for\n• Practice with sample questions\n• Learn strategies for different types of tests\n• Get tailored advice for technical or behavioral assessments\n\nWhat type of assessment are you preparing for?";
    default:
      return "Hello! I'm your personalized career AI assistant. I've reviewed your profile information and can help with resumes, cover letters, interview preparation, and general career advice tailored to your background. What would you like assistance with today?";
  }
};

/**
 * Format a list of messages into a context string for the AI
 */
export const formatConversationContext = (messages: Array<{ role: string; content: string }>): string => {
  return messages
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');
};

/**
 * Extract the type of URL from a URL string
 */
export const extractUrlType = (url: string): string => {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('linkedin.com')) {
    return 'LinkedIn profile';
  } else if (lowerUrl.includes('indeed.com') || lowerUrl.includes('glassdoor.com') || lowerUrl.includes('monster.com')) {
    return 'job posting';
  } else if (lowerUrl.includes('github.com')) {
    return 'GitHub profile';
  } else if (lowerUrl.includes('medium.com') || lowerUrl.includes('dev.to')) {
    return 'tech article';
  } else {
    return 'website';
  }
};

/**
 * Get a specialized prompt for a conversation type
 */
export const getChatPromptForType = (
  type: ConversationType,
  userMessage: string,
  contextMessages: string,
  options?: { brief?: boolean; depth?: 'light' | 'medium' | 'deep'; format?: 'bullet' | 'paragraph' }
): string => {
  // Default options
  const { brief = false, depth = 'medium', format = 'paragraph' } = options || {};
  
  // Base prompt that's common for all conversation types
  let prompt = `User message: ${userMessage}\n\n`;
  
  // Add conversation context if available
  if (contextMessages) {
    prompt += `Previous conversation:\n${contextMessages}\n\n`;
  }
  
  // Type-specific instructions
  switch (type) {
    case 'resume':
      prompt += `You are an expert resume consultant. Provide ${brief ? 'concise' : 'detailed'} advice on crafting an effective resume that stands out to employers and ATS systems. ${
        depth === 'deep' 
          ? 'Include specific formatting tips, content strategies, and industry-specific advice.' 
          : depth === 'light' 
          ? 'Focus on the most critical aspects only.' 
          : 'Balance general best practices with specific advice for their situation.'
      } ${
        format === 'bullet' 
          ? 'Structure your response with bullet points for clarity.'
          : 'Structure your response in clear paragraphs.'
      }`;
      break;
      
    case 'cover_letter':
      prompt += `You are an expert cover letter writer. Help the user craft a compelling cover letter that connects their experience to job requirements. ${
        brief ? 'Be concise and focused.' : 'Provide comprehensive guidance.'
      } ${
        depth === 'deep' 
          ? 'Include structural advice, storytelling techniques, and specific phrasing suggestions.' 
          : depth === 'light' 
          ? 'Focus only on the most important elements.' 
          : 'Balance general best practices with tailored advice.'
      } ${
        format === 'bullet' 
          ? 'Use bullet points for clarity.'
          : 'Use clear paragraphs for detailed explanations.'
      }`;
      break;
      
    case 'interview_prep':
      prompt += `You are an expert interview coach. Help the user prepare for job interviews with ${
        brief ? 'concise' : 'detailed'
      } guidance. ${
        depth === 'deep' 
          ? 'Provide example answers, strategies for difficult questions, and presentation tips.' 
          : depth === 'light' 
          ? 'Focus on core interview strategies only.' 
          : 'Balance general interview best practices with specific advice.'
      } ${
        format === 'bullet' 
          ? 'Structure your response with clear bullet points.'
          : 'Use clear paragraphs with examples where helpful.'
      }`;
      break;
      
    case 'linkedin':
      prompt += `You are a LinkedIn profile optimization expert. Provide ${
        brief ? 'concise' : 'detailed'
      } advice on improving their LinkedIn presence. ${
        depth === 'deep' 
          ? 'Include specific section improvements, keyword optimization, and networking strategies.' 
          : depth === 'light' 
          ? 'Focus on the most critical profile elements only.' 
          : 'Balance general LinkedIn best practices with specific profile advice.'
      } ${
        format === 'bullet' 
          ? 'Use bullet points for clarity.'
          : 'Structure your response in informative paragraphs.'
      }`;
      break;
      
    case 'job_search':
      prompt += `You are a job search strategist. Provide ${
        brief ? 'concise' : 'detailed'
      } advice on effective job search techniques. ${
        depth === 'deep' 
          ? 'Include advice on job boards, networking, company research, and application strategies.' 
          : depth === 'light' 
          ? 'Focus on the most essential job search strategies.' 
          : 'Balance general job search best practices with specific advice.'
      } ${
        format === 'bullet' 
          ? 'Use bullet points for clarity.'
          : 'Structure your response in clear paragraphs.'
      }`;
      break;
      
    case 'assessment':
      prompt += `You are an assessment preparation expert. Provide ${
        brief ? 'concise' : 'detailed'
      } guidance on preparing for job assessments and tests. ${
        depth === 'deep' 
          ? 'Include specific strategies for different assessment types, practice techniques, and calming methods.' 
          : depth === 'light' 
          ? 'Focus on the most essential preparation strategies.' 
          : 'Balance general assessment preparation with specific advice.'
      } ${
        format === 'bullet' 
          ? 'Use bullet points for clarity.'
          : 'Structure your response in informative paragraphs.'
      }`;
      break;
      
    default:
      prompt += `You are a career development expert. Provide ${
        brief ? 'concise' : 'detailed'
      } career advice tailored to the user's needs. ${
        depth === 'deep' 
          ? 'Include specific strategies, resources, and actionable steps.' 
          : depth === 'light' 
          ? 'Focus on the most essential advice only.' 
          : 'Balance general career best practices with specific advice.'
      } ${
        format === 'bullet' 
          ? 'Use bullet points for clarity.'
          : 'Structure your response in clear paragraphs.'
      }`;
  }
  
  // Final instructions for all conversation types
  prompt += `\n\nBe supportive, professional, and focus on providing actionable advice. Avoid generic statements and always tie your advice to the user's specific situation when possible.`;
  
  return prompt;
};
