
import { ConversationMessage, ConversationType } from "../aiService";

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
        content: getSystemPromptForType(conversationType)
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

    // Make API call to our own backend endpoint
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
      const errorData = await response.json();
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const data = await response.json() as ChatResponseBody;
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.content;
  } catch (error) {
    console.error('Error in generateChatResponse:', error);
    throw error;
  }
};

// Helper function to get system prompts based on conversation type
function getSystemPromptForType(type: ConversationType): string {
  switch(type) {
    case 'resume':
      return "You are a professional resume writer and career coach. Help the user create or improve their resume. Provide specific, tailored advice based on their experience and the job they're targeting. Be concise but thorough, and format content in a clean, professional way.";
    case 'cover_letter':
      return "You are an expert at writing compelling cover letters. Help the user create a cover letter that highlights their relevant experience and skills for the specific job they're applying to. Be professional, authentic, and persuasive.";
    case 'interview_prep':
      return "You are an interview coach with expertise in preparing candidates. Help the user prepare for job interviews by providing common questions, strategies for effective answers, and feedback on their practice responses. Be supportive but honest in your assessment.";
    default:
      return "You are a helpful career development assistant. Provide guidance, advice, and support for various career-related questions and needs.";
  }
}
