
import { 
  Conversation, 
  ConversationMetadata, 
  Message, 
  ConversationType
} from "./types/conversationTypes";

import {
  fetchConversations,
  fetchConversation,
  createConversation,
  updateConversation,
  deleteConversation
} from "./api/conversationApi";

import { sendMessage } from "./api/messageService";
import { createSpecializedConversation, createDefaultConversation } from "./api/conversationCreators";

import {
  getChatPromptForType,
  getWelcomeMessageForType
} from "./utils/conversationUtils";

// Re-export types
export type { 
  ConversationType, 
  Conversation, 
  Message, 
  ConversationMetadata
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
