
import { ConversationType } from "../types/conversationTypes";

/**
 * Validate message content
 */
export const validateMessageContent = (content: string): string => {
  if (!content) {
    return '';
  }
  
  // Trim long messages to prevent database issues
  if (content.length > 100000) {
    return content.substring(0, 100000) + '... (message truncated due to length)';
  }
  
  return content;
};

/**
 * Format conversation context for AI
 */
export const formatConversationContext = (messages: { role: string, content: string }[]): string => {
  return messages.map(msg => 
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 500)}`
  ).join('\n\n');
};

/**
 * Extract URL type from a URL string
 */
export const extractUrlType = (url: string): string => {
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('indeed.com') || url.includes('ziprecruiter.com')) return 'job';
  if (url.includes('github.com')) return 'github';
  if (url.includes('docs.google.com')) return 'document';
  return 'website';
};
