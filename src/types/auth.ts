
import { User, Session } from '@supabase/supabase-js';

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

// Auth provider type
export type AuthProviderType = 'google' | 'twitter' | 'linkedin_oidc';

// Auth context interface
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  linkedInProfile: LinkedInProfile | null;
  isLoading: boolean;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, meta?: any) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithProvider: (provider: AuthProviderType) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  
  // Profile management
  importLinkedInProfile: () => Promise<LinkedInProfile>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}
