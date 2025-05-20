
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
}

// Options for progressive/streaming responses
export interface ProgressiveResponseOptions {
  brief?: boolean;
  depth?: 'low' | 'medium' | 'high';
  format?: 'paragraph' | 'bullets' | 'markdown' | 'code' | 'steps';
}

// Complete AI Provider Service interface
export interface AIProviderService {
  generateResponse: (
    prompt: string, 
    conversationType: ConversationType,
    options?: AIModelOptions & ProgressiveResponseOptions
  ) => Promise<string>;
  
  analyzeFile: (
    fileUrl: string,
    fileName: string,
    fileType: string,
    profileContext?: string,
    options?: AIModelOptions
  ) => Promise<string>;
  
  analyzeUrl: (
    url: string,
    type: string,
    profileContext?: string
  ) => Promise<string>;
  
  resetProviders: () => void;
}
