
import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, LinkedInProfile, AuthContextType } from './types';
import { fetchUserProfile } from './authUtils';
import { 
  loginWithEmail as loginWithEmailAction,
  signUpWithEmail as signUpWithEmailAction,
  loginWithProvider as loginWithProviderAction,
  logout as logoutAction,
  updateProfile as updateProfileAction,
  importLinkedInProfile as importLinkedInProfileAction
} from './authActions';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const refreshProfile = async () => {
    try {
      if (!user) return;

      const data = await fetchUserProfile(user.id);
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Defer profile loading to prevent Supabase deadlocks
          setTimeout(() => {
            if (mounted) {
              refreshProfile();
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLinkedInProfile(null);
        }

        // On token refresh or initial load, update state
        if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await refreshProfile();
        }
        
        setIsLoading(false);
        setInitialLoadDone(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
          setInitialLoadDone(true);
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Create wrapper functions to pass user context to actions
  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginWithEmailAction(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      await signUpWithEmailAction(email, password, fullName);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProvider = async (provider: 'google' | 'linkedin_oidc' | 'twitter') => {
    setIsLoading(true);
    try {
      await loginWithProviderAction(provider);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutAction();
      setUser(null);
      setProfile(null);
      setSession(null);
      setLinkedInProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      await updateProfileAction(updates, user.id);
      await refreshProfile();
    } catch (error: any) {
      throw error;
    }
  };

  const importLinkedInProfile = async () => {
    try {
      const profile = await importLinkedInProfileAction();
      setLinkedInProfile(profile);
      return profile;
    } catch (error: any) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAuthenticated: !!user,
        isLoading: isLoading || !initialLoadDone,
        linkedInProfile,
        loginWithEmail,
        signUpWithEmail,
        loginWithProvider,
        logout,
        importLinkedInProfile,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
