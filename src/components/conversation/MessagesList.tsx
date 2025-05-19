
import { RefObject } from "react";
import ChatMessage from "@/components/conversation/ChatMessage";
import { Message } from "@/services/conversationService";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const MessagesList = ({ messages, isLoading, messagesEndRef }: MessagesListProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-muted-foreground">No messages yet.</p>
          <p className="text-sm text-muted-foreground">
            Start the conversation by sending a message below.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage
            key={message.id || `msg-${message.created_at}`}
            message={message}
            isLoading={!message.id || message.id.startsWith('temp')}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
