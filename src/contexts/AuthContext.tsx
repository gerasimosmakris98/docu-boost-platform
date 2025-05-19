
import { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  AuthContextType, 
  UserProfile, 
  LinkedInProfile, 
  AuthProviderType 
} from '@/types/auth';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useProfileManagement } from '@/hooks/useProfileManagement';

// Create context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const { fetchProfile, updateProfile: updateUserProfile } = useProfileManagement();
  const { signIn, signUp, signInWithMagicLink, signOut, loginWithProvider } = useAuthActions();

  // Set up auth state listener and check for existing session
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

  // Mock implementation until real LinkedIn API integration
  const importLinkedInProfile = async (): Promise<LinkedInProfile> => {
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

  // Define context value with all methods
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    profile,
    linkedInProfile,
    isLoading,
    
    // Auth actions
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    logout: signOut, // Alias for signOut
    loginWithProvider,
    loginWithEmail: signIn, // Alias for signIn
    signUpWithEmail: (email, password, fullName) => signUp(email, password, { full_name: fullName }),
    
    // Profile management
    importLinkedInProfile,
    updateProfile: async (data) => {
      if (!user) throw new Error('No authenticated user');
      setIsLoading(true);
      const updatedProfile = await updateUserProfile(user.id, data);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
      setIsLoading(false);
    },
    refreshProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
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

// Export types from the types file
export type { UserProfile, LinkedInProfile, AuthProviderType };
