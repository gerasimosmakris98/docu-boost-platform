
export type AIProvider = 'openai' | 'perplexity' | 'fallback';

export interface ProviderConfig {
  functionName: string;
  analyzeFunction: string;
  isAvailable: boolean;
}

export interface FileAnalysisOptions {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileContent?: string;
}
