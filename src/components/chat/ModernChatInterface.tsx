
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bot, Loader2 } from "lucide-react";
import { Conversation, Message } from "@/services/conversationService";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";

interface ModernChatInterfaceProps {
  conversationId?: string;
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
}

const ModernChatInterface = ({ 
  conversationId, 
  conversation, 
  messages: initialMessages, 
  isLoading 
}: ModernChatInterfaceProps) => {
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
    <div className="flex flex-col h-full bg-black">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Bot className="h-12 w-12 mb-4 text-green-500" />
            <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              AI Career Advisor
            </h2>
            <p className="text-gray-400 max-w-md">
              Your personal AI assistant for career guidance, resume building, interview preparation, and more.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isThinking={message.id?.startsWith('temp-ai')} 
            />
          ))
        )}
        <div ref={messagesEndRef} />
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

export default ModernChatInterface;
