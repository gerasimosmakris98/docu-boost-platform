
import { Json } from "@/integrations/supabase/types";

export type ConversationType = 'general' | 'resume' | 'interview_prep' | 'cover_letter' | 'job_search' | 'linkedin';

// Make ConversationMetadata compatible with Json type by adding index signature
export interface ConversationMetadata {
  linkedDocumentId?: string;
  jobDescription?: string;
  attachments?: string[];
  [key: string]: Json | undefined; // Add index signature to make it compatible with Json type
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  type: ConversationType;
  created_at: string;
  updated_at: string;
  metadata: ConversationMetadata;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  attachments?: string[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}
