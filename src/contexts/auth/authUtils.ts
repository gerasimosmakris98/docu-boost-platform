
import { supabase } from '@/integrations/supabase/client';
import { AuthError, AppRole, Profile } from './types';

/**
 * Clean up auth state to prevent limbo states
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Enhanced error handling for auth operations
 */
export const handleAuthError = (error: any): AuthError => {
  console.error('Auth error:', error);
  
  // Map common Supabase auth errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
    'user_not_found': 'No account found with this email address.',
    'email_not_confirmed': 'Please check your email and click the confirmation link to activate your account.',
    'signup_disabled': 'New account registration is currently disabled.',
    'email_address_invalid': 'Please enter a valid email address.',
    'password_too_short': 'Password must be at least 8 characters long.',
    'weak_password': 'Password is too weak. Please use a stronger password with letters, numbers, and symbols.',
    'email_already_registered': 'An account with this email already exists. Try signing in instead.',
    'rate_limit_exceeded': 'Too many attempts. Please wait a moment and try again.',
    'network_error': 'Network error. Please check your connection and try again.',
  };

  const code = error?.error_description || error?.message || error?.code || 'unknown_error';
  const message = errorMappings[code] || error?.message || 'An unexpected error occurred. Please try again.';
  
  return {
    message,
    code,
    details: error?.error_description || error?.details
  };
};

/**
 * Transform database profile to Profile type with proper type conversion
 */
export const transformDatabaseProfile = (dbProfile: any): Profile | null => {
  if (!dbProfile) return null;
  
  return {
    id: dbProfile.id,
    username: dbProfile.username,
    avatar_url: dbProfile.avatar_url,
    full_name: dbProfile.full_name,
    title: dbProfile.title,
    location: dbProfile.location,
    phone: dbProfile.phone,
    website: dbProfile.website,
    headline: dbProfile.headline,
    summary: dbProfile.summary,
    onboarding_completed: dbProfile.onboarding_completed,
    career_level: dbProfile.career_level,
    industry: dbProfile.industry,
    goals: dbProfile.goals,
    preferences: typeof dbProfile.preferences === 'object' && dbProfile.preferences !== null 
      ? dbProfile.preferences as Record<string, any>
      : {},
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at,
  };
};

/**
 * Get the current user's profile from the database
 */
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return transformDatabaseProfile(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Get the current user's roles
 */
export const fetchUserRoles = async (userId: string): Promise<AppRole[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user roles:', error);
      return ['user']; // Default to user role
    }

    return data?.map(item => item.role as AppRole) || ['user'];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return ['user'];
  }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
    };
  }
  
  return { isValid: true };
};

/**
 * Generate secure password reset token
 */
export const generateResetToken = (): string => {
  return crypto.getRandomValues(new Uint32Array(4)).join('-');
};
