import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import { unifiedMessageService } from "@/services/unifiedMessageService";
import ModernChatBubble from "./ModernChatBubble";
import ModernChatInput from "./ModernChatInput";
import ChatHeader from "./ChatHeader";
import MessageSearch from "./MessageSearch";
import TypingIndicator from "./TypingIndicator";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import ModernCard from "@/components/ui/ModernCard";
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
  const isMobile = useIsMobile();
  const { isOnline, isReconnecting } = useNetworkStatus();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Update messages when initialMessages changes
  useEffect(() => {
    console.log('Updating messages in StreamlinedChatInterface:', initialMessages.length, 'messages');
    setMessages(initialMessages);
    setFilteredMessages(initialMessages);
    setRetryCount(0);
  }, [initialMessages]);

  // Filter messages based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = messages.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [messages, searchQuery]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages]);

  // Network status handling
  useEffect(() => {
    if (!isOnline) {
      toast.error("No internet connection. Messages will be sent when connection is restored.");
    } else if (isReconnecting) {
      toast.success("Connection restored");
    }
  }, [isOnline, isReconnecting]);
  
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: location.pathname } });
      return;
    }
    
    if (!conversationId) {
      toast.error("No conversation selected");
      return;
    }
    
    if (!messageText.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    if (!isOnline) {
      toast.error("Cannot send message while offline");
      return;
    }
    
    console.log('Sending message:', messageText);
    
    // Add user message to UI immediately
    const optimisticUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
      attachments: []
    };
    
    setMessages(prev => {
      console.log('Adding user message to UI. Previous count:', prev.length);
      return [...prev, optimisticUserMessage];
    });
    
    // Show typing indicator
    setIsTyping(true);
    setIsSending(true);
    
    try {
      console.log('Calling unifiedMessageService.sendMessage');
      const response = await unifiedMessageService.sendMessage(conversationId, messageText, []);
      
      console.log('Response received:', response);
      
      if (response && response.aiResponse) {
        console.log('StreamlinedChatInterface: Adding real AI response to UI');
        setMessages(prev => [...prev, response.aiResponse]);
        setRetryCount(0);
      } else {
        console.warn('StreamlinedChatInterface: No AI response received. Removing optimistic user message.');
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticUserMessage.id)
        );
      }
    } catch (error: any) {
      console.error("StreamlinedChatInterface: Error sending message:", error);
      
      // Remove the optimistic user message
      setMessages(prev =>
        prev.filter(msg => msg.id !== optimisticUserMessage.id)
      );
      
      setRetryCount(prev => prev + 1);
      
      if (retryCount < 3) {
        toast.error(`Failed to send message. Retry attempt ${retryCount + 1}/3`);
      } else {
        toast.error("Failed to send message after multiple attempts. Please check your connection.");
      }
      
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }, [isAuthenticated, conversationId, navigate, isOnline, retryCount]);

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

  const handleRegenerateMessage = useCallback(async (messageIndex: number) => {
    const message = filteredMessages[messageIndex];
    if (!message) return;
    
    try {
      const regenerated = await unifiedMessageService.regenerateMessage(message.id || '');
      if (regenerated) {
        setMessages(prev => 
          prev.map(msg => msg.id === message.id ? regenerated : msg)
        );
        toast.success("Message regenerated");
      }
    } catch (error) {
      console.error("Error regenerating message:", error);
      toast.error("Failed to regenerate message");
    }
  }, [filteredMessages]);

  const handleEditMessage = useCallback((messageIndex: number) => {
    console.log("Editing message at index:", messageIndex);
    toast.info("Message editing feature coming soon!");
  }, []);

  // Show loading state with improved spinner
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 via-blue-900 to-black">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 mx-auto"
          />
          <p className="text-white/70 text-lg">Loading AI Career Advisor...</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-blue-900 to-black">
        {/* Network status indicator */}
        {!isOnline && (
          <div className="bg-red-500/20 border-b border-red-500/30 p-2 text-center text-red-300 text-sm z-10">
            No internet connection - messages will be sent when reconnected
          </div>
        )}

        {/* Chat Header */}
        <div className="z-10">
          <ChatHeader
            conversation={conversation}
            onDelete={handleDeleteConversation}
            onRename={handleRenameConversation}
          />
        </div>

        {/* Search Bar */}
        <div className="p-2 border-b border-white/10 z-10">
          <MessageSearch
            onSearch={setSearchQuery}
            onClear={() => setSearchQuery("")}
          />
        </div>
        
        {/* Messages area */}
        <div 
          className="flex-1 overflow-y-auto p-4 overscroll-contain min-h-0 z-10"
          style={{ WebkitOverflowScrolling: 'touch' }}
          role="log"
          aria-live="polite"
        >
          {filteredMessages.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ModernCard className="p-8 text-center max-w-md" gradient>
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="text-4xl mb-4 relative"
                >
                  <Bot className="h-16 w-16 mx-auto text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Welcome to AI Career Advisor
                </h3>
                <p className="text-white/80 mb-4 leading-relaxed">
                  I'm here to help you with your career journey. Ask me about resumes, interviews, job search strategies, or any career-related questions.
                </p>
                <p className="text-sm text-white/60">
                  Start by typing a message below or choose a suggestion.
                </p>
              </ModernCard>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {filteredMessages.map((message, index) => (
                  <ModernChatBubble
                    key={message.id || `msg-${index}-${message.created_at}`}
                    isUser={message.role === 'user'}
                    isLoading={message.id?.startsWith('temp')}
                    onRegenerate={message.role === 'assistant' ? () => handleRegenerateMessage(index) : undefined}
                    onEdit={message.role === 'user' ? () => handleEditMessage(index) : undefined}
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
        
        {/* Input area */}
        <div className="z-10">
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
