
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import EnhancedChatInterface from "@/components/chat/enhanced/EnhancedChatInterface";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import KeyboardShortcuts from "@/components/chat/KeyboardShortcuts";
import ChatSuggestions from "@/components/chat/ChatSuggestions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const EnhancedChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initChat = async () => {
      setIsInitializing(true);
      setIsLoading(true);
      setError(null);

      if (authLoading) {
        return;
      }

      if (!isAuthenticated) {
        navigate("/auth", { state: { from: location.pathname } });
        setIsInitializing(false);
        setIsLoading(false);
        return;
      }

      try {
        if (id) {
          // Load existing conversation
          const { conversation: loadedConversation, messages: loadedMessages } =
            await conversationService.getConversation(id);

          if (loadedConversation) {
            setConversation(loadedConversation);
            setMessages(loadedMessages);
            setShowSuggestions(loadedMessages.length === 0);
          } else {
            setError("Conversation not found");
            toast.error("Conversation not found");
            navigate("/chat", { replace: true });
            return;
          }
        } else {
          // Auto-create a new conversation when accessing /chat without ID
          console.log("Auto-creating new conversation...");
          const newConversation = await conversationService.createSpecializedConversation('general');
          if (newConversation) {
            navigate(`/chat/${newConversation.id}`, { replace: true });
            return;
          } else {
            setError("Failed to create conversation");
            toast.error("Failed to create conversation");
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        setError("Failed to load chat");
        toast.error("Failed to load chat");
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };

    initChat();
  }, [id, isAuthenticated, authLoading, navigate, location.pathname]);

  const handleNewChat = async () => {
    try {
      const newConversation = await conversationService.createSpecializedConversation('general');
      if (newConversation) {
        navigate(`/chat/${newConversation.id}`);
        toast.success("New conversation started");
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast.error("Failed to create new conversation");
    }
  };

  const handleSearch = () => {
    toast.info("Use the search bar in the chat header");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    console.log("Suggestion clicked:", suggestion);
  };

  // Enhanced loading state
  if (isInitializing || authLoading) {
    return (
      <UnifiedLayout>
        <div className="flex items-center justify-center h-full">
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="h-16 w-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 mx-auto shadow-2xl"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-blue-500/20"
                style={{ filter: 'blur(8px)' }}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <h2 className="text-2xl font-bold text-white">Initializing AI Career Advisor</h2>
              <p className="text-white/70 text-lg">Preparing your personalized experience...</p>
            </motion.div>
          </motion.div>
        </div>
      </UnifiedLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <UnifiedLayout>
        <div className="flex items-center justify-center h-full">
          <motion.div 
            className="text-center space-y-4 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <span className="text-red-400 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            <p className="text-white/70">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </UnifiedLayout>
    );
  }
  
  return (
    <UnifiedLayout activeConversationId={id}>
      <KeyboardShortcuts
        onNewChat={handleNewChat}
        onSearch={handleSearch}
        onToggleSidebar={() => {}}
      />
      
      <div className="flex flex-col h-full">
        <EnhancedChatInterface 
          key={id}
          conversationId={id}
          conversation={conversation}
          messages={messages}
          isLoading={isLoading}
        />
        
        {/* Enhanced suggestions for empty conversations */}
        <AnimatePresence>
          {showSuggestions && messages.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatSuggestions
                onSuggestionClick={handleSuggestionClick}
                conversationType={conversation?.type}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </UnifiedLayout>
  );
};

export default EnhancedChatPage;
