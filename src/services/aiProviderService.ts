
// This file is just a re-export to maintain backward compatibility
import { aiProviderService } from './ai/aiProviderService';
// Use "export type" syntax to fix isolatedModules issue
export type { AIProvider } from './ai/types';
export { aiProviderService };
