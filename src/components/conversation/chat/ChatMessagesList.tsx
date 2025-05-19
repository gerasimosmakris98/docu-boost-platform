import { RefObject } from "react";
import ChatMessage from "@/components/conversation/ChatMessage";
import { Message } from "@/services/conversationService";
import { Loader2 } from "lucide-react";

interface ChatMessagesListProps {
  messages: Message[];
  loading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const ChatMessagesList = ({ messages, loading, messagesEndRef }: ChatMessagesListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Format long messages for better readability
  const formatMessageContent = (content: string) => {
    // Keep the character limit reasonable
    const maxPreviewLength = 1000;
    
    // If the message is too long, truncate it and add an ellipsis
    if (content.length > maxPreviewLength) {
      return content.substring(0, maxPreviewLength) + "...";
    }
    
    return content;
  };
  
  return (
    <div className="space-y-4">
      {messages.map((message, index) => {
        // Format the message content for better display
        const formattedContent = formatMessageContent(message.content);
        
        // Clone the message and update its content
        const displayMessage = {
          ...message,
          content: formattedContent
        };
        
        return (
          <ChatMessage 
            key={message.id || index}
            message={displayMessage}
            isLoading={message.id === undefined || message.id.startsWith('temp')}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessagesList;
