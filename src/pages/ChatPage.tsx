
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import StreamlinedChatInterface from "@/components/chat/StreamlinedChatInterface";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
import KeyboardShortcuts from "@/components/chat/KeyboardShortcuts";
import ChatSuggestions from "@/components/chat/ChatSuggestions";
import { toast } from "sonner";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  useEffect(() => {
    const initChat = async () => {
      setIsInitializing(true);
      setIsLoading(true);

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
            toast.error("Failed to create conversation");
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
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
    // This would focus the search input in the chat interface
    toast.info("Use the search bar in the chat header");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    // This would set the message in the input and potentially send it
    console.log("Suggestion clicked:", suggestion);
  };

  if (isInitializing || authLoading) {
    return (
      <UnifiedLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-400">Loading AI Career Advisor...</p>
          </div>
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
        <StreamlinedChatInterface 
          key={id}
          conversationId={id}
          conversation={conversation}
          messages={messages}
          isLoading={isLoading}
        />
        
        {/* Show suggestions for empty conversations */}
        {showSuggestions && messages.length === 0 && !isLoading && (
          <ChatSuggestions
            onSuggestionClick={handleSuggestionClick}
            conversationType={conversation?.type}
          />
        )}
      </div>
    </UnifiedLayout>
  );
};

export default ChatPage;
