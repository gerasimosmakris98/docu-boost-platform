
import { 
  Conversation, 
  ConversationMetadata, 
  Message, 
  ConversationType,
  ConversationMessage 
} from "./types/conversationTypes";

import {
  fetchConversations,
  fetchConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  sendMessage,
  createSpecializedConversation,
  createDefaultConversation
} from "./api/conversationApi";

import {
  getChatPromptForType,
  getWelcomeMessageForType
} from "./utils/conversationUtils";

// Re-export types
export type { 
  ConversationType, 
  Conversation, 
  Message, 
  ConversationMetadata,
  ConversationMessage
};

// Create a single service object that combines all the functionality
export const conversationService = {
  // Fetch user's conversations
  getConversations: fetchConversations,

  // Fetch a specific conversation with its messages
  getConversation: fetchConversation,

  // Create a new conversation
  createConversation,

  // Update a conversation
  updateConversation,

  // Delete a conversation
  deleteConversation,

  // Chat with AI
  sendMessage,

  // Get specialized chat contexts for different document types
  getChatPromptForType,

  // Get welcome message for conversation type
  getWelcomeMessageForType,

  // Create a specialized conversation
  createSpecializedConversation,

  // Create a default conversation if none exists
  createDefaultConversation
};
