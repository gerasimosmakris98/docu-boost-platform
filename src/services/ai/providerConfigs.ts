import { AIProvider, ProviderConfig } from './types';

// Configuration for our AI providers
export const providers: Record<Exclude<AIProvider, 'fallback'>, ProviderConfig> = {
  openai: {
    functionName: 'generate-ai-response',
    analyzeFunction: 'analyze-file',
    isAvailable: true // Will be dynamically checked on first use
  },
  perplexity: {
    functionName: 'perplexity-ai-response',
    analyzeFunction: 'perplexity-analyze-file',
    isAvailable: true // Will be dynamically checked on first use
  }
};

// Default provider order - we'll try in this sequence
export const providerOrder: AIProvider[] = ['perplexity', 'openai', 'fallback'];

// Keep track of which providers have been marked as unavailable
export const unavailableProviders = new Set<AIProvider>();
