
import { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cleanupAuthState } from '@/services/authService';

// Define missing types that other components are using
export type AuthProviderType = 'google' | 'twitter' | 'linkedin_oidc';

// LinkedIn profile interface used by multiple components
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

// User profile interface - updated to match the database schema
export interface UserProfile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  title?: string;
  location?: string;
  phone?: string;
  updated_at?: string;
  username?: string;
  headline?: string;
  summary?: string;
  created_at?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  linkedInProfile: LinkedInProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, meta?: any) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut that other components are using
  isLoading: boolean;
  // Additional methods used by other components
  loginWithProvider: (provider: AuthProviderType) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  importLinkedInProfile: () => Promise<LinkedInProfile>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Get user session and profile on mount
  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state change: ${event}`, session);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        setUser(session?.user || null);
        
        // Defer profile fetching to next tick to avoid potential deadlocks
        if (session?.user) {
          setTimeout(async () => {
            if (isMounted) {
              const userProfile = await fetchProfile(session.user.id);
              if (userProfile && isMounted) {
                setProfile(userProfile);
              }
              if (isMounted) setIsLoading(false);
            }
          }, 0);
        } else {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
        setProfile(null);
        setLinkedInProfile(null);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
    });

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session);
        
        if (session && isMounted) {
          setIsAuthenticated(true);
          setUser(session.user);
          
          // Fetch user profile if authenticated
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile && isMounted) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
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
      
      setIsAuthenticated(true);
      setUser(data.user);
      
      toast.success('Signed in successfully!');
      
      // Force page reload for a clean state
      window.location.href = '/chat';
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast.error(error.message || 'Failed to sign in.');
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, meta: any = {}) => {
    setIsLoading(true);
    
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
      
      setIsAuthenticated(true);
      setUser(data.user);
      
      toast.success('Signed up successfully!');
      
      // Force page reload for a clean state
      window.location.href = '/chat';
    } catch (error: any) {
      console.error("Sign-up error:", error);
      toast.error(error.message || 'Failed to sign up.');
      setIsLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
      setLinkedInProfile(null);
      
      toast.success('Signed out successfully!');
      
      // Force page reload for a clean state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast.error(error.message || 'Failed to sign out.');
    } finally {
      setIsLoading(false);
    }
  };

  // Adding missing methods that components are trying to use
  const loginWithProvider = async (provider: AuthProviderType) => {
    setIsLoading(true);
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
        provider,
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
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    return signUp(email, password, { full_name: fullName });
  };

  const importLinkedInProfile = async (): Promise<LinkedInProfile> => {
    // Mock implementation until the real LinkedIn API integration is set up
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockProfile: LinkedInProfile = {
          title: 'Senior Software Engineer',
          company: 'Tech Company',
          headline: 'Passionate developer creating innovative solutions',
          summary: 'Experienced engineer with a track record of delivering high-quality products.',
          experience: [
            {
              title: 'Senior Software Engineer',
              company: 'Tech Company',
              duration: '2020-Present',
              description: 'Leading development of cloud applications.'
            },
            {
              title: 'Software Engineer',
              company: 'Previous Corp',
              duration: '2018-2020',
              description: 'Developed web applications.'
            }
          ],
          education: [
            {
              school: 'University of Technology',
              degree: 'BS in Computer Science',
              year: '2018'
            }
          ],
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'AWS']
        };
        
        setLinkedInProfile(mockProfile);
        resolve(mockProfile);
      }, 1500);
    });
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No authenticated user');
    
    try {
      setIsLoading(true);
      
      // Update the profile data with id
      const profileData = {
        id: user.id,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);
      
      if (error) throw error;
      
      // Refresh profile
      const updatedProfile = await fetchProfile(user.id);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const userProfile = await fetchProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Alias for signOut
  const logout = signOut;

  const value: AuthContextType = {
    isAuthenticated,
    user,
    profile,
    linkedInProfile,
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    logout,
    isLoading,
    loginWithProvider,
    loginWithEmail,
    signUpWithEmail,
    importLinkedInProfile,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
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
