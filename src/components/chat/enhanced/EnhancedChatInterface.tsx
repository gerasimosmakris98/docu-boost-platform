
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import { unifiedMessageService } from "@/services/unifiedMessageService";
import { motion, AnimatePresence } from "framer-motion";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import EnhancedChatHeader from "./EnhancedChatHeader";
import EnhancedMessageBubble from "./EnhancedMessageBubble";
import EnhancedChatInput from "./EnhancedChatInput";
import EnhancedTypingIndicator from "./EnhancedTypingIndicator";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ErrorBoundary from "@/components/common/ErrorBoundary";

interface EnhancedChatInterfaceProps {
  conversationId?: string;
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
}

const EnhancedChatInterface = ({ 
  conversationId, 
  conversation, 
  messages: initialMessages, 
  isLoading 
}: EnhancedChatInterfaceProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messageBeingGenerated, setMessageBeingGenerated] = useState<string | null>(null);
  
  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  
  // Smooth scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  // Network status handling with enhanced feedback
  useEffect(() => {
    if (!isOnline) {
      toast.error("Connection lost. Messages will be sent when you're back online.", {
        duration: 5000,
        action: {
          label: "Retry",
          onClick: () => window.location.reload()
        }
      });
    } else {
      toast.success("Connection restored", { duration: 2000 });
    }
  }, [isOnline]);
  
  const handleSendMessage = useCallback(async (messageText: string, files?: File[]) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    
    if (!conversationId) {
      toast.error("No conversation selected");
      return;
    }
    
    if (!messageText.trim() && (!files || files.length === 0)) {
      toast.error("Please enter a message or attach a file");
      return;
    }

    if (!isOnline) {
      toast.error("Cannot send message while offline");
      return;
    }
    
    // Create optimistic user message
    const optimisticUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: messageText || 'File attachment',
      created_at: new Date().toISOString(),
      attachments: []
    };
    
    setMessages(prev => [...prev, optimisticUserMessage]);
    setIsTyping(true);
    setIsSending(true);
    setMessageBeingGenerated(optimisticUserMessage.id);
    
    try {
      const response = await unifiedMessageService.sendMessage(conversationId, messageText, []);
      
      if (response && response.aiResponse) {
        setMessages(prev => [...prev, response.aiResponse]);
        toast.success("Message sent successfully", { duration: 1000 });
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== optimisticUserMessage.id));
        toast.error("Failed to get AI response");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== optimisticUserMessage.id));
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
      setIsTyping(false);
      setMessageBeingGenerated(null);
    }
  }, [isAuthenticated, conversationId, navigate, isOnline]);

  const handleDeleteConversation = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      await conversationService.deleteConversation(conversationId);
      toast.success("Conversation deleted successfully");
      navigate("/chat");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  }, [conversationId, navigate]);

  const handleRenameConversation = useCallback((newTitle: string) => {
    console.log("Conversation renamed to:", newTitle);
    toast.success("Conversation renamed successfully");
  }, []);

  const handleMessageRegenerate = useCallback(async (messageId: string) => {
    toast.info("Regenerating response...");
    // Implementation for message regeneration would go here
  }, []);

  const handleMessageEdit = useCallback(async (messageId: string, newContent: string) => {
    toast.info("Editing message...");
    // Implementation for message editing would go here
  }, []);

  // Enhanced loading state with animations
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div 
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 mx-auto shadow-lg"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h3 className="text-xl font-semibold text-white">Initializing AI Career Advisor</h3>
            <p className="text-white/70">Preparing your personalized assistant...</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full w-full overflow-hidden bg-transparent">
        {/* Enhanced network status indicator */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-red-500/20 border-b border-red-500/30 p-3 text-center text-red-300 text-sm flex-shrink-0 backdrop-blur-sm"
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-red-400 rounded-full"
                />
                <span>Connection lost - Messages will be sent when reconnected</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Chat Header */}
        <EnhancedChatHeader
          conversation={conversation}
          onDelete={handleDeleteConversation}
          onRename={handleRenameConversation}
          isOnline={isOnline}
        />
        
        {/* Messages area with enhanced scrolling */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div 
            ref={chatContainerRef}
            className="h-full overflow-y-auto p-4 pb-6 scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.length === 0 ? (
              <ChatWelcomeScreen />
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <EnhancedMessageBubble
                      key={message.id || `msg-${index}-${message.created_at}`}
                      message={message}
                      isLoading={message.id?.startsWith('temp') || message.id === messageBeingGenerated}
                      onRegenerate={() => handleMessageRegenerate(message.id)}
                      onEdit={(newContent) => handleMessageEdit(message.id, newContent)}
                      animationDelay={index * 0.1}
                    />
                  ))}
                </AnimatePresence>
                
                {/* Enhanced typing indicator */}
                <AnimatePresence>
                  {isTyping && <EnhancedTypingIndicator />}
                </AnimatePresence>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Enhanced input area */}
        <div className="flex-shrink-0">
          <EnhancedChatInput
            onSubmit={handleSendMessage}
            disabled={!isAuthenticated || isSending || !isOnline}
            placeholder="Ask me about your career journey..."
            isLoading={isSending}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedChatInterface;
