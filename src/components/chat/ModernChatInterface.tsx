
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import MessagesList from "./components/MessagesList";
import ChatInput from "./components/ChatInput";
import { aiProviderService } from "@/services/ai/aiProviderService";
import { useIsMobile } from "@/hooks/use-mobile";
import Footer from "@/components/layout/Footer";

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
  
  // Reset AI providers when component mounts or conversation changes
  useEffect(() => {
    if (conversationId) {
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
        // If error occurs, replace loading message with friendly error message
        const errorAiMessage: Message = {
          id: `error-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: "I apologize, but I'm currently experiencing some technical difficulties. I've switched to a basic guidance mode to help you. Here are some general tips:\n\n- Keep your resume concise and focused on achievements\n- Tailor your application materials to each job description\n- Prepare for interviews by researching the company and practicing common questions\n- Follow up after interviews with a thank you note\n\nPlease try again in a few moments.",
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(errorAiMessage)
        );
        
        toast.error("AI service is currently unavailable", {
          description: "Using fallback mode with simplified responses"
        });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      // Create a more descriptive error message depending on the error type
      let errorMessage = "I apologize, but I encountered an error while processing your request. I've switched to a simplified response mode to continue helping you.";
      
      // Check if it's a quota exceeded or rate limit error
      if (error.message?.includes('quota') || 
          error.message?.includes('exceeded') || 
          error.message?.includes('rate limit') || 
          error.status === 429 || 
          error.status === 402) {
        errorMessage = "I apologize, but we've reached our AI usage limit with our current provider. I've switched to a simplified guidance mode to continue helping you. Here are some general tips related to your request:\n\n- Focus on quantifiable achievements in your career materials\n- Use keywords from job descriptions in your resume and cover letters\n- Prepare specific examples for behavioral interview questions\n- Network actively on LinkedIn by engaging with industry content";
        
        toast.error("AI service limit reached", {
          description: "Using fallback mode with simplified responses",
        });
      } else {
        toast.error("Failed to send message");
      }
      
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
        className="flex-1 overflow-y-auto p-2 sm:p-4 overscroll-contain" 
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
          isDisabled={!isAuthenticated}
          isSending={isSending}
          isModern={true}
        />
        {/* Mini footer only visible on desktop */}
        {!isMobile && <div className="px-4 py-2">
          <div className="flex justify-end space-x-3 text-xs text-gray-500">
            <Link to="/legal/terms" className="hover:text-gray-300">Terms</Link>
            <Link to="/legal/privacy" className="hover:text-gray-300">Privacy</Link>
          </div>
        </div>}
      </div>
    </div>
  );
};

// We need to add the Link component import at the top
import { Link } from "react-router-dom";

export default ModernChatInterface;
