
import { ConversationType } from '../types/conversationTypes';

// Re-export ConversationType to be used by other modules
export type { ConversationType };

// Available AI providers
export type AIProvider = 'openai' | 'fallback';

// Base AI model options
export interface AIModelOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  model?: string; // Add model property to support specifying which model to use
}

// Options for progressive/streaming responses
export interface ProgressiveResponseOptions {
  brief?: boolean;
  depth?: 'low' | 'medium' | 'high';
  format?: 'paragraph' | 'bullets' | 'markdown' | 'code' | 'mixed'; // Added 'mixed' as a valid format
}

// AI response structure
export interface AIResponseResult {
  generatedText: string;
  sourceUrls: string[];
}

// Complete AI Provider Service interface
export interface AIProviderService {
  generateResponse: (
    prompt: string, 
    conversationType: ConversationType,
    options?: AIModelOptions & ProgressiveResponseOptions
  ) => Promise<AIResponseResult>;
  
  analyzeFile: (
    fileUrl: string,
    fileName: string,
    fileType: string,
    profileContext?: string,
    options?: AIModelOptions
  ) => Promise<AIResponseResult>;
  
  analyzeUrl: (
    url: string,
    type: string,
    profileContext?: string
  ) => Promise<AIResponseResult>;
  
  resetProviders: () => void;
}
