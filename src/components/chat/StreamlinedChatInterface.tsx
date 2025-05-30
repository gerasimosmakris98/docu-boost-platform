
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import { unifiedMessageService } from "@/services/unifiedMessageService";
import ModernChatBubble from "./ModernChatBubble";
import ModernChatInput from "./ModernChatInput";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Bot } from "lucide-react";

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
  const { isOnline } = useNetworkStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Network status handling
  useEffect(() => {
    if (!isOnline) {
      toast.error("No internet connection");
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
    
    // Add user message to UI immediately
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
    
    try {
      const response = await unifiedMessageService.sendMessage(conversationId, messageText, []);
      
      if (response && response.aiResponse) {
        setMessages(prev => [...prev, response.aiResponse]);
      } else {
        setMessages(prev => prev.filter(msg => msg.id !== optimisticUserMessage.id));
        toast.error("Failed to get AI response");
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== optimisticUserMessage.id));
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }, [isAuthenticated, conversationId, navigate, isOnline]);

  const handleDeleteConversation = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      await conversationService.deleteConversation(conversationId);
      toast.success("Conversation deleted");
      navigate("/chat");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  }, [conversationId, navigate]);

  const handleRenameConversation = useCallback((newTitle: string) => {
    console.log("Conversation renamed to:", newTitle);
  }, []);

  // Show loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 mx-auto"
          />
          <p className="text-white/70 text-lg">Loading conversation...</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full w-full overflow-hidden">
        {/* Network status indicator */}
        {!isOnline && (
          <div className="bg-red-500/20 border-b border-red-500/30 p-2 text-center text-red-300 text-sm flex-shrink-0">
            No internet connection
          </div>
        )}

        {/* Chat Header */}
        <ChatHeader
          conversation={conversation}
          onDelete={handleDeleteConversation}
          onRename={handleRenameConversation}
        />
        
        {/* Messages area - Proper viewport calculations */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 pb-6">
            {messages.length === 0 ? (
              <motion.div 
                className="flex flex-col items-center justify-center h-full text-center p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="p-8 text-center max-w-md mx-auto">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="text-4xl mb-4"
                  >
                    <Bot className="h-16 w-16 mx-auto text-blue-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    Welcome to AI Career Advisor
                  </h3>
                  <p className="text-white/80 mb-4 leading-relaxed">
                    I'm here to help you with your career journey. Ask me about resumes, interviews, job search strategies, or any career-related questions.
                  </p>
                  <p className="text-sm text-white/60">
                    Start by typing a message below.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <ModernChatBubble
                      key={message.id || `msg-${index}-${message.created_at}`}
                      isUser={message.role === 'user'}
                      isLoading={message.id?.startsWith('temp')}
                      timestamp={new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    >
                      {message.content}
                    </ModernChatBubble>
                  ))}
                </AnimatePresence>
                
                {/* Typing indicator */}
                {isTyping && <TypingIndicator />}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input area - Fixed height */}
        <div className="flex-shrink-0">
          <ModernChatInput
            onSubmit={handleSendMessage}
            disabled={!isAuthenticated || isSending || !isOnline}
            placeholder="Ask me about your career..."
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default StreamlinedChatInterface;
