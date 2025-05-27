
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import ModernChatSidebar from "@/components/chat/ModernChatSidebar";
import StreamlinedChatInterface from "@/components/chat/StreamlinedChatInterface";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);
  
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
          // Create new conversation
          const newConversation = await conversationService.createSpecializedConversation('general');
          
          if (newConversation) {
            navigate(`/chat/${newConversation.id}`, { replace: true });
            return;
          } else {
            toast.error("Failed to create new chat");
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (isInitializing || authLoading) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Mobile menu button */}
      {isMobile && sidebarCollapsed && (
        <div className="absolute top-0 left-0 z-10 p-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {/* Sidebar */}
      <ModernChatSidebar 
        activeConversationId={id} 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      
      {/* Main chat area */}
      <div className={cn(
        "flex-1 flex flex-col h-full",
        isMobile && sidebarCollapsed && "pl-12 md:pl-0"
      )}>
        <StreamlinedChatInterface 
          key={id}
          conversationId={id!}
          conversation={conversation}
          messages={messages}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatPage;
