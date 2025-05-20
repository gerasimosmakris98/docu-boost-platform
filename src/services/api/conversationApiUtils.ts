
import { ConversationType } from "../types/conversationTypes";
import { Json } from "@/integrations/supabase/types";

/**
 * Convert a string to the appropriate ConversationType
 */
export const asConversationType = (typeString: string): ConversationType => {
  if (
    typeString === 'resume' ||
    typeString === 'cover_letter' ||
    typeString === 'interview_prep' ||
    typeString === 'linkedin' ||
    typeString === 'job_search' ||
    typeString === 'assessment'
  ) {
    return typeString as ConversationType;
  }
  
  // Default to general if the type is not recognized
  return 'general';
};

/**
 * Parse metadata from JSON to a strongly typed object
 */
export const parseMetadata = (metadata: Json | null): Record<string, any> => {
  if (!metadata) return {};
  
  if (typeof metadata === 'object') {
    return metadata as Record<string, any>;
  }
  
  try {
    if (typeof metadata === 'string') {
      return JSON.parse(metadata);
    }
  } catch (error) {
    console.error('Error parsing metadata:', error);
  }
  
  return {};
};
