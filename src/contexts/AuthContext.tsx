
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthProvider, User, authService } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithProvider: (provider: AuthProvider) => Promise<void>;
  logout: () => Promise<void>;
  importLinkedInProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session on mount
    // For now, we'll just simulate a quick load
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  const loginWithProvider = async (provider: AuthProvider) => {
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
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const importLinkedInProfile = async () => {
    try {
      return await authService.importLinkedInProfile();
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
