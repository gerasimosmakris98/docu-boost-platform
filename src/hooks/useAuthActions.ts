
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cleanupAuthState } from '@/services/authService';

export const useAuthActions = () => {
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out before signing in
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success('Signed in successfully!');
      
      // Force page reload for a clean state
      window.location.href = '/chat';
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast.error(error.message || 'Failed to sign in.');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, meta: any = {}): Promise<void> => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out before signing up
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: meta
        }
      });
      
      if (error) throw error;
      
      toast.success('Signed up successfully!');
      
      // Force page reload for a clean state
      window.location.href = '/chat';
    } catch (error: any) {
      console.error("Sign-up error:", error);
      toast.error(error.message || 'Failed to sign up.');
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string): Promise<void> => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      });
      
      if (error) throw error;
      
      toast.success('Check your email for the magic link to sign in!');
    } catch (error: any) {
      console.error("Magic link sign-in error:", error);
      toast.error(error.message || 'Failed to send magic link.');
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      toast.success('Signed out successfully!');
      
      // Force page reload for a clean state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast.error(error.message || 'Failed to sign out.');
      throw error;
    }
  };

  const loginWithProvider = async (provider: string): Promise<void> => {
    try {
      // Clean up existing state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      // The actual auth happens after redirecting, so we just return
      // The success toast will be shown after successful redirect
    } catch (error: any) {
      console.error(`Sign-in with ${provider} error:`, error);
      toast.error(error.message || `Failed to sign in with ${provider}.`);
      throw error;
    }
  };

  return {
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    loginWithProvider,
  };
};
