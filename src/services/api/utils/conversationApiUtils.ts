
import { ConversationMetadata, ConversationType } from "../../types/conversationTypes";
import { Json } from "@/integrations/supabase/types";

// Helper function to safely convert string to ConversationType
export const asConversationType = (type: string): ConversationType => {
  const validTypes: ConversationType[] = ['general', 'resume', 'interview_prep', 'cover_letter', 'job_search', 'linkedin', 'assessment'];
  return validTypes.includes(type as ConversationType) 
    ? (type as ConversationType) 
    : 'general';
};

// Helper function to safely parse metadata from Supabase response
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

// Prepare metadata for Supabase
export const prepareMetadataForSupabase = (metadata: ConversationMetadata): Json => {
  return metadata as unknown as Json;
};
