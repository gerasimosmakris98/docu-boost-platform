
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService, LinkedInProfile } from '@/services/authService';

// Rename the imported type to avoid conflict with the component
export type AuthProviderType = 'google' | 'linkedin' | 'twitter';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  linkedInProfile: LinkedInProfile | null;
  loginWithProvider: (provider: AuthProviderType) => Promise<void>;
  logout: () => Promise<void>;
  importLinkedInProfile: () => Promise<LinkedInProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);

  useEffect(() => {
    // Check for existing user session on mount
    // For now, we'll just simulate a quick load
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const loginWithProvider = async (provider: AuthProviderType) => {
    setIsLoading(true);
    try {
      const user = await authService.loginWithProvider(provider);
      setUser(user);
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setLinkedInProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const importLinkedInProfile = async () => {
    try {
      const profile = await authService.importLinkedInProfile();
      setLinkedInProfile(profile);
      return profile;
    } catch (error) {
      console.error('Import LinkedIn profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        linkedInProfile,
        loginWithProvider,
        logout,
        importLinkedInProfile
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
