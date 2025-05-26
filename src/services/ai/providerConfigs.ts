
import { AIModelOptions } from './types';
import { ConversationType } from '../types/conversationTypes';

// Available AI providers
export const providers = ['openai', 'fallback'] as const;
export type AIProvider = typeof providers[number];

// Order to try providers in
export const providerOrder: AIProvider[] = ['openai', 'fallback'];

// Keep track of unavailable providers
export const unavailableProviders = new Set<AIProvider>();

// Get model options based on conversation type
export const getModelOptions = (conversationType: ConversationType): AIModelOptions => {
  const baseOptions: AIModelOptions = {
    temperature: 0.7,
    maxTokens: 800,
  };
  
  switch (conversationType) {
    case 'resume':
      return {
        ...baseOptions,
        temperature: 0.6, // More precise
        maxTokens: 1000, // Longer responses for detailed feedback
      };
    case 'cover_letter':
      return {
        ...baseOptions,
        temperature: 0.7, // More creative
        maxTokens: 1000, // Longer responses
      };
    case 'interview_prep':
      return {
        ...baseOptions,
        temperature: 0.6, // More precise
        maxTokens: 1200, // Longer for example answers
      };
    case 'job_search':
      return {
        ...baseOptions,
        temperature: 0.7, // Balance of creative and precise
      };
    case 'linkedin':
    case 'linkedin_analysis':
      return {
        ...baseOptions,
        temperature: 0.6, // More precise
        maxTokens: 1000, // Longer responses for detailed feedback
      };
    case 'assessment':
      return {
        ...baseOptions,
        temperature: 0.5, // Very precise
        maxTokens: 1200, // Longer for detailed assessment
      };
    default:
      return baseOptions;
  }
};
