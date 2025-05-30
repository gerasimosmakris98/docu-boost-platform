
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState, handleAuthError, validateEmail, validatePassword } from './authUtils';
import { AuthProviderType, LinkedInProfile, AuthError } from './types';

// Enhanced login with email and password
export const loginWithEmail = async (email: string, password: string) => {
  try {
    // Validate inputs
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (!password || password.length < 6) {
      throw new Error('Please enter your password');
    }

    // Clean up existing auth state
    cleanupAuthState();
    
    // Attempt global sign out first
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in loginWithEmail:', error);
    throw handleAuthError(error);
  }
};

// Enhanced sign up with email and password
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  try {
    // Validate inputs
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }
    
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Please enter your full name (at least 2 characters)');
    }

    // Clean up existing auth state
    cleanupAuthState();
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim()
        }
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in signUpWithEmail:', error);
    throw handleAuthError(error);
  }
};

// Enhanced OAuth login
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
    throw handleAuthError(error);
  }
};

// Enhanced logout
export const logout = async () => {
  try {
    // Clean up auth state
    cleanupAuthState();
    
    // Attempt global sign out
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
  } catch (error) {
    console.error('Error in logout:', error);
    throw handleAuthError(error);
  }
};

// Password reset functionality
export const resetPassword = async (email: string) => {
  try {
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/auth/reset-password`
      }
    );
    
    if (error) throw error;
  } catch (error) {
    console.error('Error in resetPassword:', error);
    throw handleAuthError(error);
  }
};

// Update password functionality
export const updatePassword = async (newPassword: string) => {
  try {
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error in updatePassword:', error);
    throw handleAuthError(error);
  }
};

// Enhanced profile update
export const updateProfile = async (updates: any, userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw handleAuthError(error);
  }
};

// Complete onboarding
export const completeOnboarding = async (onboardingData: any, userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...onboardingData,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error in completeOnboarding:', error);
    throw handleAuthError(error);
  }
};

// Mock LinkedIn import (enhanced version)
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
        const { data: existingLink } = await supabase
          .from('social_links')
          .select('*')
          .eq('user_id', user.id)
          .eq('platform', link.platform)
          .single();
        
        if (existingLink) {
          await supabase
            .from('social_links')
            .update({
              url: link.url,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingLink.id);
        } else {
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
    throw handleAuthError(error);
  }
};
