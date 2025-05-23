
import MessageComponent from "@/components/shared/MessageComponent";
import { Message } from "@/services/types/conversationTypes";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  showTimestamp?: boolean;
}

const ChatMessage = (props: ChatMessageProps) => {
  return <MessageComponent {...props} showTimestamp={props.showTimestamp || true} />;
};

export default ChatMessage;
