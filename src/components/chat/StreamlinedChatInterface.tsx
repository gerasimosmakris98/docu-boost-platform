
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import UnifiedChatMessage from "./UnifiedChatMessage";
import ChatInput from "./components/ChatInput";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface StreamlinedChatInterfaceProps {
  conversationId?: string;
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
}

const StreamlinedChatInterface = ({ 
  conversationId, 
  conversation, 
  messages: initialMessages, 
  isLoading 
}: StreamlinedChatInterfaceProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  
  // Update messages when initialMessages changes
  useEffect(() => {
    console.log('Updating messages in StreamlinedChatInterface:', initialMessages.length, 'messages');
    setMessages(initialMessages);
  }, [initialMessages]);
  
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
      // Create a new conversation first
      try {
        const newConversation = await conversationService.createSpecializedConversation('general');
        if (newConversation) {
          navigate(`/chat/${newConversation.id}`, { replace: true });
          return;
        }
      } catch (error) {
        toast.error("Failed to create conversation");
        return;
      }
    }
    
    if (!messageText.trim() && attachmentUrls.length === 0) {
      toast.error("Please enter a message or attach a file.");
      return;
    }
    
    console.log('Sending message:', messageText, 'attachments:', attachmentUrls);
    
    // Add user message to UI immediately
    const optimisticUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
      attachments: attachmentUrls
    };
    
    setMessages(prev => {
      console.log('Adding user message to UI. Previous count:', prev.length);
      return [...prev, optimisticUserMessage];
    });
    
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
      console.log('Calling conversationService.sendMessage');
      const response = await conversationService.sendMessage(conversationId, messageText, attachmentUrls);
      
      console.log('Response received:', response);
      
      if (response && response.aiResponse) {
        console.log('StreamlinedChatInterface: Adding real AI response to UI');
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(response.aiResponse)
        );
      } else {
        console.warn('StreamlinedChatInterface: No AI response received or sendMessage failed. Service should have toasted. Removing optimistic AI message.');
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticAiMessage.id)
        );
      }
    } catch (error: any) {
      console.error("StreamlinedChatInterface: Error sending message or processing response:", error);
      
      // Remove both the optimistic user message and the "Thinking..." AI message
      setMessages(prev =>
        prev.filter(msg => msg.id !== optimisticUserMessage.id && msg.id !== optimisticAiMessage.id)
      );
      
      toast.error("Failed to send message. Please try again.");
      
    } finally {
      setIsSending(false);
    }
  };

  // Show empty state
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Loading conversation...</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-black">
      {/* Conversation title for mobile */}
      {isMobile && conversation && (
        <div className="p-3 border-b border-gray-800 flex items-center">
          <h1 className="text-lg font-medium truncate bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            {conversation.title}
          </h1>
        </div>
      )}
      
      {/* Messages area */}
      <div 
        className="flex-1 overflow-y-auto p-2 sm:p-4 overscroll-contain min-h-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-full text-center p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-full bg-gradient-to-r from-green-500/10 to-blue-500/10 p-6 border border-green-500/20 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-4xl"
              >
                🤖
              </motion.div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Welcome to AI Career Advisor
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              I'm here to help you with your career journey. Ask me about resumes, interviews, job search strategies, or any career-related questions.
            </p>
            <p className="text-sm text-gray-500">
              Start by typing a message below.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => (
              <UnifiedChatMessage
                key={message.id || `msg-${index}-${message.created_at}`}
                message={message}
                isLoading={message.id?.startsWith('temp')}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div>
        <ChatInput
          onSendMessage={handleSendMessage}
          isDisabled={!isAuthenticated || isSending}
          isSending={isSending}
        />
      </div>
    </div>
  );
};

export default StreamlinedChatInterface;
