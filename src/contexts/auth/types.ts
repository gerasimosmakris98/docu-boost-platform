
import { User, Session } from '@supabase/supabase-js';

export type AuthProviderType = 'google' | 'linkedin_oidc' | 'twitter';

export type AppRole = 'admin' | 'moderator' | 'user';

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
  onboarding_completed?: boolean;
  career_level?: string;
  industry?: string;
  goals?: string[];
  preferences?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

interface SocialLinkType {
  platform: string;
  url: string;
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
  socialLinks?: SocialLinkType[];
}

export interface AuthError {
  message: string;
  code?: string;
  details?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userRoles: AppRole[];
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  linkedInProfile: LinkedInProfile | null;
  authError: AuthError | null;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithProvider: (provider: AuthProviderType) => Promise<void>;
  logout: () => Promise<void>;
  importLinkedInProfile: () => Promise<LinkedInProfile>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  completeOnboarding: (onboardingData: Partial<Profile>) => Promise<void>;
  clearAuthError: () => void;
}
