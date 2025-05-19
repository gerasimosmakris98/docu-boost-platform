
import { supabase } from '@/integrations/supabase/client';
import { Message } from '../types/conversationTypes';

// Helper function to format messages for the API
export const formatMessagesForApi = (messages: Message[]) => {
  return messages.map(message => ({
    role: message.role,
    content: message.content
  }));
};

// Helper function to validate message content
export const validateMessageContent = (content: string) => {
  if (!content || content.trim() === '') {
    throw new Error('Message content cannot be empty');
  }
  return content.trim();
};

// Helper function to fetch user profile context
export const fetchUserProfileContext = async (userId: string | undefined): Promise<string> => {
  if (!userId) return '';
  
  try {
    // Get basic profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    // Get social links
    const { data: socialLinks, error: socialLinksError } = await supabase
      .from('social_links')
      .select('*')
      .eq('user_id', userId);
    
    if (socialLinksError) throw socialLinksError;
    
    // Format the profile context
    let contextString = 'USER PROFILE CONTEXT:\n';
    
    if (profile) {
      contextString += `Name: ${profile.full_name || 'Unknown'}\n`;
      contextString += profile.title ? `Title: ${profile.title}\n` : '';
      contextString += profile.summary ? `Professional Summary: ${profile.summary}\n` : '';
      contextString += profile.location ? `Location: ${profile.location}\n` : '';
    }
    
    if (socialLinks && socialLinks.length > 0) {
      contextString += '\nSOCIAL PROFILES:\n';
      socialLinks.forEach(link => {
        contextString += `${link.platform}: ${link.url}\n`;
      });
    }
    
    return contextString;
    
  } catch (error) {
    console.error('Error fetching user profile context:', error);
    return '';
  }
};
