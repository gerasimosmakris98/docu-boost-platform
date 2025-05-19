
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { ConversationMetadata, ConversationType } from "../types/conversationTypes";

/**
 * Helper function to safely convert string to ConversationType
 */
export const asConversationType = (type: string): ConversationType => {
  const validTypes: ConversationType[] = [
    'general', 'resume', 'interview_prep', 'cover_letter', 
    'job_search', 'linkedin', 'assessment'
  ];
  return validTypes.includes(type as ConversationType) 
    ? (type as ConversationType) 
    : 'general';
};

/**
 * Helper function to safely parse metadata from Supabase response
 */
export const parseMetadata = (metadataRaw: any): ConversationMetadata => {
  if (!metadataRaw) return {};
  
  if (typeof metadataRaw !== 'object') return {};
  
  // Handle object case
  return {
    linkedDocumentId: typeof metadataRaw.linkedDocumentId === 'string' ? metadataRaw.linkedDocumentId : undefined,
    jobDescription: typeof metadataRaw.jobDescription === 'string' ? metadataRaw.jobDescription : undefined,
    attachments: Array.isArray(metadataRaw.attachments) ? metadataRaw.attachments : undefined,
    linkedinProfile: typeof metadataRaw.linkedinProfile === 'string' ? metadataRaw.linkedinProfile : undefined,
    assessmentUrl: typeof metadataRaw.assessmentUrl === 'string' ? metadataRaw.assessmentUrl : undefined,
    companyUrl: typeof metadataRaw.companyUrl === 'string' ? metadataRaw.companyUrl : undefined
  };
};

/**
 * Format conversation context from previous messages for AI prompt
 */
export const formatConversationContext = (messages: { role: string; content: string }[]): string => {
  if (!messages || messages.length === 0) return '';
  
  return messages
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');
};
