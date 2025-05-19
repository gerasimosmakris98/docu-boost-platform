
export type AIProvider = 'perplexity' | 'fallback';

export interface ProviderConfig {
  functionName: string;
  analyzeFunction: string;
  isAvailable: boolean;
  maxTokens: number;
  temperature: number;
}

export interface FileAnalysisOptions {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileContent?: string;
}

export interface UrlAnalysisOptions {
  url: string;
  type: 'linkedin' | 'job' | 'company' | 'assessment' | 'general';
}

export interface AIModelOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface ProgressiveResponseOptions {
  brief: boolean;
  depth: 'low' | 'medium' | 'high';
  format?: 'steps' | 'bullets' | 'paragraphs';
}

// Import the ConversationType from the main types file to avoid duplication
import type { ConversationType } from '../types/conversationTypes';
export type { ConversationType };
