import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import UnifiedChatMessage from "./UnifiedChatMessage";
import ChatInput from "./components/ChatInput";
import ChatHeader from "./ChatHeader";
import MessageSearch from "./MessageSearch";
import TypingIndicator from "./TypingIndicator";
import MessageActions from "./MessageActions";
import { motion, AnimatePresence } from "framer-motion";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Update messages when initialMessages changes
  useEffect(() => {
    console.log('Updating messages in StreamlinedChatInterface:', initialMessages.length, 'messages');
    setMessages(initialMessages);
    setFilteredMessages(initialMessages);
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
  
  const handleSendMessage = async (messageText: string, attachmentUrls: string[]) => {
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: location.pathname } });
      return;
    }
    
    if (!conversationId) {
      toast.error("No conversation selected");
      return;
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
    
    // Show typing indicator
    setIsTyping(true);
    setIsSending(true);
    
    try {
      console.log('Calling conversationService.sendMessage');
      const response = await conversationService.sendMessage(conversationId, messageText, attachmentUrls);
      
      console.log('Response received:', response);
      
      if (response && response.aiResponse) {
        console.log('StreamlinedChatInterface: Adding real AI response to UI');
        setMessages(prev => [...prev, response.aiResponse]);
      } else {
        console.warn('StreamlinedChatInterface: No AI response received or sendMessage failed. Service should have toasted. Removing optimistic user message.');
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticUserMessage.id)
        );
      }
    } catch (error: any) {
      console.error("StreamlinedChatInterface: Error sending message or processing response:", error);
      
      // Remove the optimistic user message
      setMessages(prev =>
        prev.filter(msg => msg.id !== optimisticUserMessage.id)
      );
      
      toast.error("Failed to send message. Please try again.");
      
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversationId) return;
    
    try {
      await conversationService.deleteConversation(conversationId);
      toast.success("Conversation deleted");
      navigate("/chat");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleRenameConversation = (newTitle: string) => {
    // Update conversation title in parent component if needed
    // This would typically be handled by a callback prop
    console.log("Conversation renamed to:", newTitle);
  };

  const handleRegenerateMessage = async (messageIndex: number) => {
    // Implementation for regenerating AI responses
    console.log("Regenerating message at index:", messageIndex);
    toast.info("Regeneration feature coming soon!");
  };

  const handleEditMessage = (messageIndex: number) => {
    // Implementation for editing user messages
    console.log("Editing message at index:", messageIndex);
    toast.info("Message editing feature coming soon!");
  };

  const handleMessageFeedback = (messageId: string, isPositive: boolean) => {
    // Implementation for message feedback
    console.log("Feedback for message:", messageId, "positive:", isPositive);
  };

  // Show loading state
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
      {/* Chat Header */}
      <ChatHeader
        conversation={conversation}
        onDelete={handleDeleteConversation}
        onRename={handleRenameConversation}
      />

      {/* Search Bar */}
      <div className="p-2 border-b border-gray-800">
        <MessageSearch
          onSearch={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />
      </div>
      
      {/* Messages area */}
      <div 
        className="flex-1 overflow-y-auto p-2 sm:p-4 overscroll-contain min-h-0"
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
          <div className="space-y-4">
            <AnimatePresence>
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id || `msg-${index}-${message.created_at}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="group"
                >
                  <UnifiedChatMessage
                    message={message}
                    isLoading={message.id?.startsWith('temp')}
                  />
                  <div className="mt-2">
                    <MessageActions
                      message={message}
                      onRegenerate={() => handleRegenerateMessage(index)}
                      onEdit={() => handleEditMessage(index)}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing indicator */}
            {isTyping && <TypingIndicator />}
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
