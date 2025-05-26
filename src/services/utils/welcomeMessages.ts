
import { ConversationType } from '../types/conversationTypes';

export const getWelcomeMessageForType = (type: ConversationType): string => {
  switch (type) {
    case 'resume':
      return "Hello! I'm your Resume Advisor. I'm here to help you create a standout resume that gets you noticed. To get started, I'd love to learn more about you:\n\n• What's your current role or the position you're targeting?\n• What industry are you in?\n• How many years of experience do you have?\n• Do you have a specific job you're applying for?\n\nFeel free to share as much or as little as you'd like - I'll tailor my advice to your situation!";
    
    case 'cover_letter':
      return "Hi there! I'm your Cover Letter Advisor, ready to help you craft compelling cover letters that open doors. To provide the best guidance, I'd like to know:\n\n• What position are you applying for?\n• What industry or company interests you?\n• What are your key strengths or achievements you'd like to highlight?\n• Do you have a specific job posting you're targeting?\n\nThe more I know about your background and goals, the better I can help you shine!";
    
    case 'interview_prep':
      return "Welcome! I'm your Interview Preparation Coach. I'll help you feel confident and prepared for your upcoming interviews. Let's start by getting to know you:\n\n• What position are you interviewing for?\n• What company or industry is it in?\n• What's your current experience level in this field?\n• Are there any specific interview concerns you have?\n\nI'll provide personalized practice questions and strategies based on your situation!";
    
    case 'job_search':
      return "Hello! I'm your Job Search Strategist, here to help you navigate your career journey effectively. To create a personalized strategy, I'd love to learn about:\n\n• What type of role are you looking for?\n• What's your background and experience level?\n• Which industries or companies interest you?\n• What are your career goals?\n• Any specific challenges you're facing in your search?\n\nLet's work together to find the right opportunities for you!";
    
    case 'linkedin':
    case 'linkedin_analysis':
      return "Hi! I'm your LinkedIn Optimization Advisor. I'll help you maximize your LinkedIn presence to attract opportunities and build your professional network. To get started:\n\n• What's your current role or target position?\n• What industry are you in?\n• What are your main career goals?\n• Are you looking to attract recruiters, build your network, or establish thought leadership?\n\nShare your LinkedIn profile or tell me about your background, and I'll provide personalized optimization strategies!";
    
    case 'assessment':
      return "Welcome! I'm your Assessment Preparation Coach. I'll help you prepare for and excel in various types of assessments. To provide targeted guidance:\n\n• What type of assessment are you preparing for? (technical, behavioral, cognitive, etc.)\n• What role or company is this for?\n• What's your background in this area?\n• Are there specific topics or skills you're concerned about?\n\nLet's build a preparation strategy that sets you up for success!";
    
    default:
      return "Hello! I'm your AI Career Advisor, here to help you with all aspects of your professional journey. To provide the most helpful guidance, I'd love to learn about:\n\n• What brings you here today?\n• What's your current role or career situation?\n• What are your main career goals or challenges?\n• Is there a specific area you'd like help with?\n\nFeel free to share whatever you're comfortable with - I'm here to support your career success!";
  }
};

export const getInitialUserContext = (type: ConversationType): string => {
  return `The user has just started a ${type} conversation. This is their first interaction. I should welcome them warmly, introduce my role as their ${type} advisor, and ask relevant questions to understand their background and goals. I should NOT make assumptions about their career situation.`;
};
