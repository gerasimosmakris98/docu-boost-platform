
import { RefObject } from "react";
import { Message } from "@/services/types/conversationTypes";
import MessagesListComponent from "@/components/shared/MessagesListComponent";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  isModern?: boolean;
  messagesEndRef?: RefObject<HTMLDivElement>;
}

const MessagesList = (props: MessagesListProps) => {
  return <MessagesListComponent {...props} />;
};

export default MessagesList;
