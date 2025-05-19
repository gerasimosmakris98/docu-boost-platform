
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type AuthProviderType = 'google' | 'linkedin_oidc' | 'twitter';

export interface Profile {
  id: string;
  username?: string;
  avatar_url?: string;
  full_name?: string;
  title?: string;
  location?: string;
  phone?: string;
  website?: string;
  headline?: string;
  summary?: string;
}

export interface LinkedInProfile {
  title: string;
  company: string;
  headline?: string;
  summary?: string;
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    year: string;
  }[];
  skills: string[];
  profileUrl?: string;
  profileScore?: number;
  recommendations?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  linkedInProfile: LinkedInProfile | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithProvider: (provider: AuthProviderType) => Promise<void>;
  logout: () => Promise<void>;
  importLinkedInProfile: () => Promise<LinkedInProfile>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to clean up auth state to prevent limbo states
const cleanupAuthState = () => {
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);

  const refreshProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          // Defer profile loading to prevent Supabase deadlocks
          setTimeout(() => {
            refreshProfile();
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
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        refreshProfile();
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Clean up existing state to prevent limbo
      cleanupAuthState();

      try {
        // Attempt global sign out first
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast.success('Signed in successfully!');
      return data.session;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
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
      return data.session;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithProvider = async (provider: AuthProviderType) => {
    setIsLoading(true);
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Map the provider name from our app to Supabase's expected format
      // Note: LinkedIn now uses linkedin_oidc instead of deprecated linkedin
      const providerMapping: Record<AuthProviderType, string> = {
        'google': 'google',
        'linkedin_oidc': 'linkedin_oidc',
        'twitter': 'twitter'
      };

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: providerMapping[provider],
        options: {
          redirectTo: window.location.origin + '/profile'
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
      setLinkedInProfile(null);
      
      toast.info('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const importLinkedInProfile = async () => {
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

      setLinkedInProfile(mockProfile);
      toast.success('LinkedIn profile imported successfully!');
      return mockProfile;
    } catch (error: any) {
      toast.error(error.message || 'Failed to import LinkedIn profile');
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
        isLoading,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
