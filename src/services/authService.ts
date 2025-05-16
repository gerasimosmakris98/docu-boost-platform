
// Mock authentication service
// Replace with actual OAuth implementations (Supabase, Auth0, Firebase)

import { toast } from "sonner";
import { AuthProviderType } from "@/contexts/AuthContext";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: AuthProviderType;
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

// Mock user data
const mockUsers: Record<AuthProviderType, User> = {
  google: {
    id: 'g-123456',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    avatar: 'https://i.pravatar.cc/150?u=john',
    provider: 'google'
  },
  linkedin: {
    id: 'l-123456',
    name: 'Jane Smith',
    email: 'jane.smith@linkedin.com',
    avatar: 'https://i.pravatar.cc/150?u=jane',
    provider: 'linkedin'
  },
  twitter: {
    id: 't-123456',
    name: 'Sam Wilson',
    email: 'sam.wilson@twitter.com',
    avatar: 'https://i.pravatar.cc/150?u=sam',
    provider: 'twitter'
  }
};

export const authService = {
  // Mock login with provider
  loginWithProvider: async (provider: AuthProviderType): Promise<User> => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        toast.success(`Signed in with ${provider} successfully!`);
        resolve(mockUsers[provider]);
      }, 1500);
    });
  },

  // Mock logout
  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.info('Signed out successfully');
        resolve();
      }, 500);
    });
  },

  // Import LinkedIn profile data
  importLinkedInProfile: async (): Promise<LinkedInProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        toast.success('LinkedIn profile imported successfully!');
        resolve({
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
        });
      }, 2000);
    });
  }
};
