
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import MessagesList from "./components/MessagesList";
import ChatInput from "./components/ChatInput";

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
        // If error occurs, replace loading message with error message
        const errorAiMessage: Message = {
          id: `error-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: "I apologize, but I'm currently experiencing some technical difficulties. This might be due to high demand or system limitations. Please try again in a few moments.",
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(errorAiMessage)
        );
        
        toast.error("AI service is currently unavailable", {
          description: "This might be due to usage limits. Please try again later."
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // If error occurs, remove loading message and add error message
      const errorAiMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: "I apologize, but I encountered an error while processing your request. Please try again later.",
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => 
        prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(errorAiMessage)
      );
      
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-black">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessagesList 
          messages={messages} 
          isLoading={isLoading} 
          isModern={true}
        />
      </div>
      
      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isDisabled={!isAuthenticated}
        isSending={isSending}
        isModern={true}
      />
    </div>
  );
};

export default ModernChatInterface;
