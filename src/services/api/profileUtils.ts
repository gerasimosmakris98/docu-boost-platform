import { supabase } from "@/integrations/supabase/client";
import { ConversationType } from "../types/conversationTypes";

/**
 * Get user profile context for AI responses
 */
export const getUserProfileContext = async (userId: string): Promise<string | null> => {
  try {
    if (!userId) return null;
    
    // Fetch user profile data
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile for AI context:', error);
      return null;
    }
    
    if (!profile) return null;
    
    // Create a context summary from profile data
    let context = `User Profile Information:`;
    
    if (profile.full_name) {
      context += `\n- Name: ${profile.full_name}`;
    }
    
    if (profile.title) {
      context += `\n- Title: ${profile.title}`;
    }
    
    if (profile.location) {
      context += `\n- Location: ${profile.location}`;
    }
    
    if (profile.summary) {
      context += `\n- Professional Summary: ${profile.summary}`;
    }
    
    return context;
  } catch (error) {
    console.error('Error getting user profile context:', error);
    return null;
  }
};

/**
 * Get profile data for specific advisor type
 */
export const getProfileDataForAdvisor = async (userId: string, conversationType: ConversationType): Promise<string | null> => {
  try {
    if (!userId) return null;
    
    const userContext = await getUserProfileContext(userId);
    if (!userContext) return null;
    
    // Add conversation type specific guidance
    let additionalContext = '';
    
    switch (conversationType) {
      case 'resume':
        additionalContext = 'When addressing resume questions, focus on helping the user emphasize their relevant experience and skills, proper formatting, and achievement-focused bullet points.';
        break;
      case 'cover_letter':
        additionalContext = 'For cover letter questions, focus on helping the user craft a compelling narrative that connects their experience to the job requirements.';
        break;
      case 'interview_prep':
        additionalContext = 'When helping with interview preparation, focus on helping the user prepare responses that highlight their relevant experience and skills, and practice common interview scenarios.';
        break;
      case 'job_search':
        additionalContext = 'For job search questions, focus on helping the user develop effective search strategies, identify suitable opportunities, and optimize their application process.';
        break;
      case 'linkedin':
        additionalContext = 'When addressing LinkedIn profile questions, focus on helping the user optimize their profile for visibility, engagement, and professional networking.';
        break;
      default:
        additionalContext = 'Focus on providing personalized career advice based on the user\'s background and goals.';
    }
    
    return `${userContext}\n\nAdvisor Role: ${additionalContext}`;
  } catch (error) {
    console.error('Error getting profile data for advisor:', error);
    return null;
  }
};
