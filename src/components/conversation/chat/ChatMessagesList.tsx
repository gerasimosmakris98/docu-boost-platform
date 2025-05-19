
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
  
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <ChatMessage 
          key={message.id || index}
          message={message}
          isLoading={message.id === undefined || message.id.startsWith('temp')}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessagesList;
