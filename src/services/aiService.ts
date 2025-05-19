
// AI service for chat functionality
import { ConversationType, ConversationMessage } from './types/conversationTypes';
import { toast } from "sonner";

export type { ConversationType, ConversationMessage };

// Mock data for document generation
interface GeneratedDocument {
  title: string;
  content: string;
}

export const aiService = {
  // Add AI service methods
  generateDocument: async (
    type: 'resume' | 'cover_letter',
    userProfile: any,
    jobDescription: string
  ): Promise<GeneratedDocument | null> => {
    try {
      console.log("Generating document:", { type, userProfile, jobDescription });
      
      // This is a mock implementation - in a real app, this would call an AI service
      const mockDocuments = {
        resume: {
          title: `${userProfile.name || 'Professional'} Resume`,
          content: `# ${userProfile.name || 'Professional'} Resume\n\n## Professional Summary\n${userProfile.summary || 'Experienced professional with a proven track record of success.'}\n\n## Experience\n- ${userProfile.title || 'Professional position'} at ${userProfile.company || 'Company'}\n\n## Education\n- Degree in relevant field\n\n## Skills\n- Relevant skill 1\n- Relevant skill 2`
        },
        cover_letter: {
          title: `Cover Letter for ${jobDescription.substring(0, 30)}...`,
          content: `# Cover Letter\n\nDear Hiring Manager,\n\nI am writing to express my interest in the position described. With my background in ${userProfile.title || 'relevant field'}, I believe I would be a great fit for this role.\n\n## Why I'm a Great Fit\n\nThe job description mentions ${jobDescription.substring(0, 100)}..., which aligns perfectly with my experience in ${userProfile.title || 'this field'}.\n\nSincerely,\n${userProfile.name || 'Candidate'}`
        }
      };
      
      return mockDocuments[type];
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
      return null;
    }
  }
};
