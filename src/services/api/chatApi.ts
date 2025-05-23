
import { ConversationMessage, ConversationType } from "../aiService";
import { getSystemPrompt } from "../utils/conversationUtils";

interface ChatRequestBody {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  conversationType: ConversationType;
}

interface ChatResponseBody {
  content: string;
  error?: string;
}

/**
 * Calls an external AI API to generate a chat response
 * In a real implementation, this would call an actual AI API like OpenAI
 */
export const generateChatResponse = async (
  message: string,
  history: ConversationMessage[],
  conversationType: ConversationType
): Promise<string> => {
  try {
    // Format messages for the API call
    const formattedMessages = [
      {
        role: 'system',
        content: getSystemPrompt(conversationType)
      },
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Make API call
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: formattedMessages,
        conversationType
      } as ChatRequestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json() as ChatResponseBody;
    return data.content;
  } catch (error) {
    console.error('Error in generateChatResponse:', error);
    throw error;
  }
};
