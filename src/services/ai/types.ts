
export type ConversationType = 
  | 'general' 
  | 'resume' 
  | 'cover_letter' 
  | 'interview_prep' 
  | 'linkedin' 
  | 'job_search' 
  | 'assessment';

export interface AIModelOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProgressiveResponseOptions {
  brief?: boolean;
  depth?: 'low' | 'medium' | 'high';
}

export interface StructuredResponse {
  generatedText: string;
  sourceUrls: string[];
}

export type AIProvider = 'openai' | 'perplexity' | 'anthropic';
