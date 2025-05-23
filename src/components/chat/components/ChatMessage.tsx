
import MessageComponent from "@/components/shared/MessageComponent";
import { Message } from "@/services/types/conversationTypes";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  isModern?: boolean;
  showTimestamp?: boolean;
}

const ChatMessage = (props: ChatMessageProps) => {
  return <MessageComponent {...props} />;
};

export default ChatMessage;
