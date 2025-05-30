
import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, LinkedInProfile, AuthContextType, AppRole, AuthError } from './types';
import { fetchUserProfile, fetchUserRoles } from './authUtils';
import { 
  loginWithEmail as loginWithEmailAction,
  signUpWithEmail as signUpWithEmailAction,
  loginWithProvider as loginWithProviderAction,
  logout as logoutAction,
  updateProfile as updateProfileAction,
  importLinkedInProfile as importLinkedInProfileAction,
  resetPassword as resetPasswordAction,
  updatePassword as updatePasswordAction,
  completeOnboarding as completeOnboardingAction
} from './authActions';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoles, setUserRoles] = useState<AppRole[]>(['user']);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const clearAuthError = () => setAuthError(null);

  const refreshProfile = async () => {
    try {
      if (!user) return;

      const [profileData, rolesData] = await Promise.all([
        fetchUserProfile(user.id),
        fetchUserRoles(user.id)
      ]);
      
      if (profileData) {
        setProfile(profileData);
      }
      
      setUserRoles(rolesData);
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return userRoles.includes(role);
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
          // Clear any previous auth errors
          setAuthError(null);
          // Defer profile loading to prevent Supabase deadlocks
          setTimeout(() => {
            if (mounted) {
              refreshProfile();
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setLinkedInProfile(null);
          setUserRoles(['user']);
          setAuthError(null);
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

  // Enhanced wrapper functions with error handling
  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await loginWithEmailAction(email, password);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signUpWithEmailAction(email, password, fullName);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProvider = async (provider: 'google' | 'linkedin_oidc' | 'twitter') => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await loginWithProviderAction(provider);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await logoutAction();
      setUser(null);
      setProfile(null);
      setSession(null);
      setLinkedInProfile(null);
      setUserRoles(['user']);
    } catch (error: any) {
      setAuthError(error);
      throw error;
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
      setAuthError(error);
      throw error;
    }
  };

  const importLinkedInProfile = async () => {
    try {
      const profile = await importLinkedInProfileAction();
      setLinkedInProfile(profile);
      return profile;
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await resetPasswordAction(email);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      await updatePasswordAction(newPassword);
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  const completeOnboarding = async (onboardingData: Partial<Profile>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      await completeOnboardingAction(onboardingData, user.id);
      await refreshProfile();
    } catch (error: any) {
      setAuthError(error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userRoles,
        session,
        isAuthenticated: !!user,
        isLoading: isLoading || !initialLoadDone,
        linkedInProfile,
        authError,
        loginWithEmail,
        signUpWithEmail,
        loginWithProvider,
        logout,
        importLinkedInProfile,
        updateProfile,
        refreshProfile,
        resetPassword,
        updatePassword,
        hasRole,
        completeOnboarding,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
