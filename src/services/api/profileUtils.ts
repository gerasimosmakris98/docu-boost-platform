
import { supabase } from "@/integrations/supabase/client";

// Get user profile data for enhancing AI responses
export async function getUserProfileContext(userId: string | undefined): Promise<string> {
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
}

// Get profile data focused on specific areas based on advisor type
export async function getProfileDataForAdvisor(userId: string | undefined, advisorType: string): Promise<string> {
  if (!userId) return '';
  
  try {
    // Get basic profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    // Get social links for linkedin advisor
    const { data: socialLinks, error: socialLinksError } = 
      advisorType === 'linkedin' ? 
      await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', userId) : 
      { data: null, error: null };
    
    if (socialLinksError) throw socialLinksError;
    
    // Format context based on advisor type
    let contextString = `PROFILE DATA FOR ${advisorType.toUpperCase()} ADVISOR:\n\n`;
    
    switch(advisorType) {
      case 'resume':
        contextString += `Name: ${profile.full_name || 'Unknown'}\n`;
        contextString += profile.title ? `Current Title: ${profile.title}\n` : '';
        contextString += profile.summary ? `Professional Summary: ${profile.summary}\n` : '';
        contextString += `Use this information to provide tailored resume advice.\n`;
        break;
        
      case 'cover_letter':
        contextString += `Name: ${profile.full_name || 'Unknown'}\n`;
        contextString += profile.title ? `Current Title: ${profile.title}\n` : '';
        contextString += profile.summary ? `Professional Background: ${profile.summary}\n` : '';
        contextString += `Use this information to help craft personalized cover letters.\n`;
        break;
        
      case 'interview_prep':
        contextString += `Name: ${profile.full_name || 'Unknown'}\n`;
        contextString += profile.title ? `Current Position: ${profile.title}\n` : '';
        contextString += profile.summary ? `Experience Summary: ${profile.summary}\n` : '';
        contextString += `Provide interview preparation tips based on this background.\n`;
        break;
        
      case 'linkedin':
        contextString += `Name: ${profile.full_name || 'Unknown'}\n`;
        contextString += profile.title ? `Current Title: ${profile.title}\n` : '';
        contextString += profile.summary ? `Profile Summary: ${profile.summary}\n` : '';
        
        if (socialLinks && socialLinks.length > 0) {
          contextString += '\nCurrent Social Profiles:\n';
          socialLinks.forEach(link => {
            contextString += `${link.platform}: ${link.url}\n`;
          });
        }
        
        contextString += `Provide LinkedIn profile optimization advice based on this information.\n`;
        break;
        
      case 'job_search':
        contextString += `Name: ${profile.full_name || 'Unknown'}\n`;
        contextString += profile.title ? `Current Position: ${profile.title}\n` : '';
        contextString += profile.location ? `Location: ${profile.location}\n` : '';
        contextString += profile.summary ? `Background: ${profile.summary}\n` : '';
        contextString += `Provide job search advice tailored to this professional background.\n`;
        break;
        
      case 'assessment':
        contextString += `Name: ${profile.full_name || 'Unknown'}\n`;
        contextString += profile.title ? `Current Role: ${profile.title}\n` : '';
        contextString += profile.summary ? `Experience: ${profile.summary}\n` : '';
        contextString += `Provide assessment preparation advice for this professional profile.\n`;
        break;
        
      default: // general career advice
        contextString += `Name: ${profile.full_name || 'Unknown'}\n`;
        contextString += profile.title ? `Current Position: ${profile.title}\n` : '';
        contextString += profile.location ? `Location: ${profile.location}\n` : '';
        contextString += profile.summary ? `Career Summary: ${profile.summary}\n` : '';
        contextString += `Provide general career advice based on this profile.\n`;
    }
    
    return contextString;
    
  } catch (error) {
    console.error(`Error fetching profile data for ${advisorType} advisor:`, error);
    return `Could not retrieve complete profile data. Please provide advice based on available information.`;
  }
}
