import { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, meta?: any) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setIsAuthenticated(true);
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for changes on auth state (login, logout, etc.)
    supabase.auth.onAuthStateChange(async (event, session: Session | null) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setIsAuthenticated(true);
      setUser(user);
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Sign-in error:", error);
      toast.error(error.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, meta: any = {}) => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: meta
        }
      });
      if (error) throw error;
      setIsAuthenticated(true);
      setUser(user);
      toast.success('Signed up successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Sign-up error:", error);
      toast.error(error.message || 'Failed to sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithMagicLink = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // emailRedirectTo: `${window.location.origin}/dashboard`,
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsAuthenticated(false);
      setUser(null);
      toast.success('Signed out successfully!');
      navigate('/');
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast.error(error.message || 'Failed to sign out.');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    isLoading,
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
