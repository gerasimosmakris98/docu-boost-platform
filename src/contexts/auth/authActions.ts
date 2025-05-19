
import { toast } from 'sonner';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';
import { AuthProviderType, Profile, LinkedInProfile } from './types';

/**
 * Login with email and password
 */
export const loginWithEmail = async (email: string, password: string) => {
  try {
    // Clean up existing state to prevent limbo
    cleanupAuthState();

    try {
      // Attempt global sign out first
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }

    // If password is empty, it's a magic link login
    if (!password) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      
      if (error) throw error;
      
      toast.success(`Magic link sent to ${email}. Please check your inbox.`);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    toast.success('Signed in successfully!');
    
    // Force page reload for a clean state
    window.location.href = '/';
  } catch (error: any) {
    toast.error(error.message || 'Failed to sign in');
    throw error;
  }
};

/**
 * Sign up with email, password and full name
 */
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  try {
    // Clean up existing state
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
    
    toast.success('Account created successfully! Please check your email to confirm your account.');
  } catch (error: any) {
    toast.error(error.message || 'Failed to create account');
    throw error;
  }
};

/**
 * Login with a third-party provider
 */
export const loginWithProvider = async (provider: AuthProviderType) => {
  try {
    // Clean up existing state
    cleanupAuthState();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
  } catch (error: any) {
    toast.error(error.message || `Failed to sign in with ${provider}`);
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logout = async () => {
  try {
    // Clean up auth state
    cleanupAuthState();
    
    // Sign out
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) throw error;
    
    toast.info('Signed out successfully');
    
    // Force page reload for a clean state
    window.location.href = '/auth';
  } catch (error: any) {
    toast.error(error.message || 'Failed to sign out');
    throw error;
  }
};

/**
 * Update a user's profile
 */
export const updateProfile = async (updates: Partial<Profile>, userId: string) => {
  try {
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    
    toast.success('Profile updated successfully');
  } catch (error: any) {
    toast.error(error.message || 'Failed to update profile');
    throw error;
  }
};

/**
 * Mock LinkedIn profile import (would be replaced with actual API integration)
 */
export const importLinkedInProfile = async (): Promise<LinkedInProfile> => {
  try {
    // For now, we'll just return a mock profile until we implement actual LinkedIn API integration
    const mockProfile: LinkedInProfile = {
      title: 'Senior Software Engineer',
      company: 'Tech Company Inc.',
      headline: 'Innovative software engineer with a passion for creating elegant solutions',
      summary: 'Experienced software professional with a track record of delivering high-quality products in agile environments.',
      experience: [
        { 
          title: 'Senior Software Engineer', 
          company: 'Tech Company Inc.', 
          duration: '2020-Present',
          description: 'Leading development of cloud-based solutions using React, TypeScript, and AWS.' 
        },
        { 
          title: 'Software Engineer', 
          company: 'Previous Company', 
          duration: '2018-2020',
          description: 'Worked on frontend applications using React and TypeScript.' 
        },
        { 
          title: 'Junior Developer', 
          company: 'First Company', 
          duration: '2016-2018',
          description: 'Developed web applications using JavaScript and PHP.' 
        }
      ],
      education: [
        {
          school: 'University of Technology',
          degree: 'Bachelor of Computer Science',
          year: '2016'
        }
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML/CSS', 'AWS', 'Git', 'Agile'],
      profileUrl: 'https://linkedin.com/in/janesmith',
      profileScore: 85
    };

    toast.success('LinkedIn profile imported successfully!');
    return mockProfile;
  } catch (error: any) {
    toast.error(error.message || 'Failed to import LinkedIn profile');
    throw error;
  }
};
