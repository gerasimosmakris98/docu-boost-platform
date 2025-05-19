
import { AIProvider, ProviderConfig } from './types';

// Configuration for our AI providers
export const providers: Record<Exclude<AIProvider, 'fallback'>, ProviderConfig> = {
  perplexity: {
    functionName: 'perplexity-ai-response',
    analyzeFunction: 'perplexity-analyze-file',
    isAvailable: true, // Will be dynamically checked on first use
    maxTokens: 1000, // Default max tokens
    temperature: 0.2 // Default temperature - lower for more focused responses
  }
};

// Default provider order - only Perplexity and fallback
export const providerOrder: AIProvider[] = ['perplexity', 'fallback'];

// Keep track of which providers have been marked as unavailable
export const unavailableProviders = new Set<AIProvider>();

// Model options based on conversation type
export const getModelOptions = (type: string): {maxTokens: number, temperature: number} => {
  switch(type) {
    case 'assessment':
      // More focused, detailed responses for assessments
      return { maxTokens: 1200, temperature: 0.1 };
    case 'interview_prep':
      // Balanced but slightly more creative for interview prep
      return { maxTokens: 1000, temperature: 0.3 };
    case 'resume':
    case 'cover_letter':
      // Precise, focused responses for documents
      return { maxTokens: 1000, temperature: 0.2 };
    case 'linkedin':
      // More creative for profile optimization
      return { maxTokens: 900, temperature: 0.3 };
    default:
      // Default balanced approach
      return { maxTokens: 800, temperature: 0.2 };
  }
};
