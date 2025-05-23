
import { RefObject } from "react";
import { Message } from "@/services/types/conversationTypes";
import MessagesListComponent from "@/components/shared/MessagesListComponent";

interface ChatMessagesListProps {
  messages: Message[];
  loading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const ChatMessagesList = ({ messages, loading, messagesEndRef }: ChatMessagesListProps) => {
  return (
    <MessagesListComponent 
      messages={messages} 
      isLoading={loading} 
      messagesEndRef={messagesEndRef}
    />
  );
};

export default ChatMessagesList;
