
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import StreamlinedChatInterface from "@/components/chat/StreamlinedChatInterface";
import UnifiedLayout from "@/components/layout/UnifiedLayout";
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
      <StreamlinedChatInterface 
        key={id}
        conversationId={id}
        conversation={conversation}
        messages={messages}
        isLoading={isLoading}
      />
    </UnifiedLayout>
  );
};

export default ChatPage;
