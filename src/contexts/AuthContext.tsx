
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase, cleanupAuthState } from '@/integrations/supabase/client';

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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
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
      
      // Force page reload for a clean state
      window.location.href = '/auth';
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
