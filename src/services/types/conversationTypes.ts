
export type ConversationType = 'general' | 'resume' | 'interview_prep' | 'cover_letter' | 'job_search' | 'linkedin' | 'assessment' | 'linkedin_analysis';

export interface ConversationMetadata {
  linkedDocumentId?: string;
  jobDescription?: string;
  attachments?: string[];
  linkedinProfile?: string;
  assessmentUrl?: string;
  companyUrl?: string;
  [key: string]: any;
}

export interface Conversation {
  id: string;
  title: string;
  type: ConversationType;
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata: ConversationMetadata;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  attachments?: string[];
  sourceUrls?: string[];
}

export interface ConversationMessage extends Message {
  isLoading?: boolean;
}
