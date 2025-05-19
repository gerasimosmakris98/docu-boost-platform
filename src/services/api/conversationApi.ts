
// Re-export all conversation API functions from their specialized modules
import { 
  fetchConversations,
  fetchConversation
} from './conversationReaders';

import {
  createConversation,
  createSpecializedConversation,
  createDefaultConversation
} from './conversationCreators';

import {
  updateConversation
} from './conversationUpdaters';

import {
  deleteConversation
} from './conversationDeletes';

import { 
  sendMessage 
} from './messageService';

import { 
  asConversationType, 
  parseMetadata 
} from './conversationApiUtils';

// Re-export utils from conversationUtils
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
  getWelcomeMessageForType,
  asConversationType,
  parseMetadata
};
