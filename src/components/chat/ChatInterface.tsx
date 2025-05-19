
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bot, Loader2 } from "lucide-react";
import { Conversation, Message } from "@/services/conversationService";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";

interface ChatInterfaceProps {
  conversationId?: string;
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
}

const ChatInterface = ({ 
  conversationId, 
  conversation, 
  messages: initialMessages, 
  isLoading 
}: ChatInterfaceProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const {
    messages,
    isSending,
    messagesEndRef,
    handleSendMessage
  } = useChat({
    conversationId,
    initialMessages
  });
  
  const onSendMessage = async (
    messageText: string, 
    attachments: { url: string; type: string; name: string }[]
  ) => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
    return handleSendMessage(messageText, attachments);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2 text-green-500" />
          <h2 className="text-lg font-medium">
            {conversation?.title || "AI Career Assistant"}
          </h2>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Bot className="h-10 w-10 mb-4 text-green-500" />
            <h3 className="text-xl font-medium mb-2">
              Welcome to AI Career Assistant
            </h3>
            <p className="text-gray-400 max-w-md">
              Ask me anything about resumes, cover letters, interview preparation, or general career advice.
            </p>
          </div>
        ) : (
          <div>
            {messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isThinking={message.id?.startsWith('temp-ai')} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <ChatInput 
        onSendMessage={onSendMessage}
        isSending={isSending}
        isDisabled={!isAuthenticated}
      />
    </div>
  );
};

export default ChatInterface;
