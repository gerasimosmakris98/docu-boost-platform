
import { ConversationMessage, ConversationType } from "../aiService";

interface ChatRequestBody {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
  conversationType: ConversationType;
  attachments?: string[];
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
  conversationType: ConversationType,
  attachments?: string[]
): Promise<string> => {
  try {
    console.log("Generating chat response for:", { message, conversationType, attachments });
    
    // Format messages for the API call
    const formattedMessages = [
      {
        role: 'system',
        content: getSystemPromptForType(conversationType, attachments)
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
        conversationType,
        attachments
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
    
    // Instead of just throwing the error, let's provide a fallback response
    // This ensures that users still get a response even if the API fails
    return `I apologize, but I encountered an error while processing your request. ${error instanceof Error ? error.message : 'Please try again later.'}`;
  }
};

// Helper function to get system prompts based on conversation type
function getSystemPromptForType(type: ConversationType, attachments?: string[]): string {
  let basePrompt = "";
  
  switch(type) {
    case 'resume':
      basePrompt = "You are a professional resume writer and career coach. Help the user create or improve their resume. Provide specific, tailored advice based on their experience and the job they're targeting. Be concise but thorough, and format content in a clean, professional way.";
      break;
    case 'cover_letter':
      basePrompt = "You are an expert at writing compelling cover letters. Help the user create a cover letter that highlights their relevant experience and skills for the specific job they're applying to. Be professional, authentic, and persuasive.";
      break;
    case 'interview_prep':
      basePrompt = "You are an interview coach with expertise in preparing candidates. Help the user prepare for job interviews by providing common questions, strategies for effective answers, and feedback on their practice responses. Be supportive but honest in your assessment.";
      break;
    default:
      basePrompt = "You are a helpful career development assistant. Provide guidance, advice, and support for various career-related questions and needs.";
  }
  
  // If there are attachments, add instructions for handling them
  if (attachments && attachments.length > 0) {
    basePrompt += "\n\nThe user has shared attachments with you. ";
    
    // Check if there might be images
    const possibleImages = attachments.some(url => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
    );
    
    // Check if there might be PDFs or documents
    const possibleDocuments = attachments.some(url => 
      /\.(pdf|doc|docx|txt|rtf|odt)$/i.test(url)
    );
    
    if (possibleImages) {
      basePrompt += "These may include images that you should describe and refer to in your response. ";
    }
    
    if (possibleDocuments) {
      basePrompt += "These may include documents such as resumes, cover letters, or job descriptions. Analyze them and provide feedback or suggestions based on their content. ";
    }
    
    basePrompt += "Always acknowledge the attached files in your response.";
  }
  
  return basePrompt;
}
