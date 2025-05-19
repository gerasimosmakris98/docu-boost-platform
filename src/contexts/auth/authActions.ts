
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/integrations/supabase/client';
import { AuthProviderType, LinkedInProfile } from './types';
import { fetchUserProfile } from './authUtils';

// Login with email and password
export const loginWithEmail = async (email: string, password: string) => {
  try {
    // Clean up existing auth state
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in loginWithEmail:', error);
    throw error;
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  try {
    // Clean up existing auth state
    cleanupAuthState();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in signUpWithEmail:', error);
    throw error;
  }
};

// Login with third-party provider
export const loginWithProvider = async (provider: AuthProviderType) => {
  try {
    // Clean up existing auth state
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in loginWithProvider:', error);
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    // Clean up auth state
    cleanupAuthState();
    
    // Attempt global sign out
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
  } catch (error) {
    console.error('Error in logout:', error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (updates: any, userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
};

// Mock LinkedIn import (in a real app, this would integrate with LinkedIn's API)
export const importLinkedInProfile = async (): Promise<LinkedInProfile> => {
  // In a real implementation, this would use OAuth to pull real LinkedIn data
  const mockLinkedInProfile: LinkedInProfile = {
    title: 'Senior Software Engineer',
    company: 'Tech Innovations Inc.',
    headline: 'Building the future of web technologies',
    summary: 'Experienced software engineer with 7+ years of expertise in React, Node.js, and cloud solutions. Passionate about creating scalable applications and mentoring junior developers.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Innovations Inc.',
        duration: '2020 - Present',
        description: 'Leading development of enterprise SaaS solutions, managing a team of 5 engineers.'
      },
      {
        title: 'Software Developer',
        company: 'WebSoft Solutions',
        duration: '2017 - 2020',
        description: 'Developed and maintained client-facing web applications using React and Node.js.'
      }
    ],
    education: [
      {
        school: 'University of Technology',
        degree: 'Master of Computer Science',
        year: '2017'
      },
      {
        school: 'State University',
        degree: 'Bachelor of Science in Software Engineering',
        year: '2015'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'Docker', 'GraphQL', 'MongoDB'],
    profileUrl: 'https://linkedin.com/in/johndoe',
    socialLinks: [
      { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' },
      { platform: 'GitHub', url: 'https://github.com/johndoe' },
      { platform: 'Portfolio', url: 'https://johndoe.dev' }
    ]
  };
  
  try {
    // Save profile data
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) throw new Error('No user found');
    
    // Update profile data
    await supabase
      .from('profiles')
      .update({
        title: mockLinkedInProfile.title,
        headline: mockLinkedInProfile.headline,
        summary: mockLinkedInProfile.summary,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    // Save social links
    if (mockLinkedInProfile.socialLinks && mockLinkedInProfile.socialLinks.length > 0) {
      for (const link of mockLinkedInProfile.socialLinks) {
        // Check if link already exists
        const { data: existingLink } = await supabase
          .from('social_links')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform', link.platform)
          .single();
        
        if (existingLink) {
          // Update existing link
          await supabase
            .from('social_links')
            .update({
              url: link.url,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingLink.id);
        } else {
          // Insert new link
          await supabase
            .from('social_links')
            .insert({
              user_id: user.id,
              platform: link.platform,
              url: link.url
            });
        }
      }
    }
    
    return mockLinkedInProfile;
  } catch (error) {
    console.error('Error saving LinkedIn profile:', error);
    return mockLinkedInProfile; // Return the data even if save fails
  }
};
