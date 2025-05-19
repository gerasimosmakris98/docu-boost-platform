import { AIProvider, ProviderConfig } from './types';

// Configuration for our AI providers
export const providers: Record<Exclude<AIProvider, 'fallback'>, ProviderConfig> = {
  perplexity: {
    functionName: 'perplexity-ai-response',
    analyzeFunction: 'perplexity-analyze-file',
    isAvailable: true // Will be dynamically checked on first use
  }
};

// Default provider order - only Perplexity and fallback
export const providerOrder: AIProvider[] = ['perplexity', 'fallback'];

// Keep track of which providers have been marked as unavailable
export const unavailableProviders = new Set<AIProvider>();
