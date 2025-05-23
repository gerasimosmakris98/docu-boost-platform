
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import MessagesList from "./components/MessagesList";
import ChatInput from "./components/ChatInput";
import { aiProviderService } from "@/services/ai/aiProviderService";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  
  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  
  // Reset AI provider availability when conversation changes
  useEffect(() => {
    if (conversationId && aiProviderService.resetProviders) {
      aiProviderService.resetProviders();
    }
  }, [conversationId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = async (messageText: string, attachmentUrls: string[]) => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: location.pathname } });
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
      content: "Thinking...",
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
        // If error occurs, replace loading message with friendly error message
        const errorAiMessage: Message = {
          id: `error-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: "I apologize, but I'm currently experiencing some technical difficulties. Please try again in a moment.",
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(errorAiMessage)
        );
        
        toast.error("AI service is currently unavailable");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Create a more descriptive error message depending on the error type
      let errorMessage = "Sorry, I encountered an issue processing your request. Let's try again in a moment.";
      
      // If error occurs, remove loading message and add error message
      const errorAiMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: errorMessage,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => 
        prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(errorAiMessage)
      );
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-black">
      {/* Conversation title for mobile */}
      {isMobile && conversation && (
        <div className="p-3 border-b border-gray-800 flex items-center">
          <h1 className="text-lg font-medium truncate">{conversation.title}</h1>
        </div>
      )}
      
      {/* Messages area with optimized performance for mobile */}
      <div 
        className="flex-1 overflow-y-auto p-2 sm:p-4 overscroll-contain min-h-0" // Added min-h-0
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <MessagesList 
          messages={messages} 
          isLoading={isLoading} 
          isModern={true}
        />
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div>
        <ChatInput
          onSendMessage={handleSendMessage}
          isDisabled={!isAuthenticated || isSending}
          isSending={isSending}
          isModern={true}
        />
      </div>
    </div>
  );
};

export default ModernChatInterface;
