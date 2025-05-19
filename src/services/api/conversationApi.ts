
// Re-export all functionality from our refactored files
import { 
  fetchConversations,
  fetchConversation,
  createConversation,
  updateConversation,
  deleteConversation
} from "./conversation/conversationCrud";

import {
  sendMessage
} from "./conversation/messagingOperations";

import {
  createSpecializedConversation,
  createDefaultConversation
} from "./conversation/specializedConversations";

// Import utils for re-export
import { getWelcomeMessageForType } from "../utils/conversationUtils";

// Export everything
export {
  fetchConversations,
  fetchConversation,
  createConversation,
  updateConversation,
  deleteConversation,
  sendMessage,
  createSpecializedConversation,
  createDefaultConversation,
  getWelcomeMessageForType
};
