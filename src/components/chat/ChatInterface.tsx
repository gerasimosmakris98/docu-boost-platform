
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { Bot } from "lucide-react";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import MessagesList from "./components/MessagesList";
import ChatInput from "./components/ChatInput";

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
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  
  // Update messages when initialMessages changes
  useState(() => {
    setMessages(initialMessages);
  });
  
  const handleSendMessage = async (messageText: string, attachmentUrls: string[]) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to send messages");
      navigate("/auth");
      return;
    }
    
    if (!conversationId) {
      toast.error("Invalid conversation");
      return;
    }
    
    // Add user message to UI immediately
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
      attachments: attachmentUrls
    };
    
    setMessages(prev => [...prev, optimisticUserMessage]);
    
    // Add AI thinking message
    const optimisticAiMessage: Message = {
      id: `temp-ai-${Date.now()}`,
      conversation_id: conversationId,
      role: 'assistant',
      content: "...",
      created_at: new Date().toISOString()
    };
    
    setIsSending(true);
    setMessages(prev => [...prev, optimisticAiMessage]);
    
    try {
      // Send the message
      const response = await conversationService.sendMessage(conversationId, messageText, attachmentUrls);
      
      // Update messages with real AI response
      if (response && response.aiResponse) {
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(response.aiResponse)
        );
      } else {
        // If no AI response, remove the loading message
        setMessages(prev => prev.filter(msg => msg.id !== optimisticAiMessage.id));
        toast.error("Failed to get AI response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== optimisticAiMessage.id));
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
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
        <MessagesList 
          messages={messages} 
          isLoading={isLoading} 
          isModern={false}
        />
      </div>
      
      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isDisabled={!isAuthenticated}
        isSending={isSending}
        isModern={false}
      />
    </div>
  );
};

export default ChatInterface;
