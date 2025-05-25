
/**
 * Utility functions for handling AI responses and extracting clean content
 */

export interface AIResponse {
  generatedText: string;
  sourceUrls?: string[];
}

/**
 * Extract clean text from AI response, handling various formats
 */
export const extractCleanText = (response: any): string => {
  console.log('Processing AI response:', response);
  
  // If response is already a string, return it
  if (typeof response === 'string') {
    // Check if it's a JSON string that needs parsing
    try {
      const parsed = JSON.parse(response);
      if (parsed.generatedText) {
        return parsed.generatedText;
      }
      return response;
    } catch {
      // Not JSON, return as is
      return response;
    }
  }
  
  // If response is an object with generatedText
  if (response && typeof response === 'object') {
    if (response.generatedText) {
      return response.generatedText;
    }
    
    // If it's a direct text response
    if (response.content) {
      return response.content;
    }
    
    // If it's wrapped in another structure
    if (response.message && response.message.content) {
      return response.message.content;
    }
  }
  
  // Fallback: convert to string and clean up
  const stringResponse = String(response);
  
  // Remove JSON artifacts if they appear in the text
  const cleanText = stringResponse
    .replace(/\{"generatedText":\s*"[^"]*",\s*"sourceUrls":\s*\[[^\]]*\]\}/g, '')
    .replace(/\{"generatedText":[^}]*\}/g, '')
    .trim();
  
  return cleanText || 'I apologize, but I encountered an issue processing the response. Please try again.';
};

/**
 * Extract source URLs from AI response
 */
export const extractSourceUrls = (response: any): string[] => {
  if (typeof response === 'string') {
    try {
      const parsed = JSON.parse(response);
      return parsed.sourceUrls || [];
    } catch {
      return [];
    }
  }
  
  if (response && typeof response === 'object') {
    return response.sourceUrls || [];
  }
  
  return [];
};

/**
 * Create a standardized AI response object
 */
export const createAIResponse = (rawResponse: any): AIResponse => {
  return {
    generatedText: extractCleanText(rawResponse),
    sourceUrls: extractSourceUrls(rawResponse)
  };
};
