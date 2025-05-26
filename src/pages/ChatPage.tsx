
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
  
  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);
  
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      
      if (authLoading) {
        return;
      }
      
      if (!isAuthenticated) {
        navigate("/auth", { state: { from: location.pathname } });
        return;
      }
      
      try {
        if (!id) {
          console.log('No conversation ID provided, creating new conversation');
          const newConversation = await conversationService.createDefaultConversation();
          if (newConversation) {
            console.log('Created new conversation:', newConversation.id);
            navigate(`/chat/${newConversation.id}`, { replace: true });
            return;
          } else {
            throw new Error('Failed to create new conversation');
          }
        }
        
        console.log('Loading conversation with ID:', id);
        const { conversation: loadedConversation, messages: loadedMessages } = 
          await conversationService.getConversation(id);
        
        if (loadedConversation) {
          console.log(`Loaded conversation: ${loadedConversation.title} with ${loadedMessages.length} messages`);
          setConversation(loadedConversation);
          setMessages(loadedMessages);
        } else {
          console.log('Conversation not found, creating new one');
          toast.error("Conversation not found, creating a new one");
          const defaultConversation = await conversationService.createDefaultConversation();
          if (defaultConversation) {
            navigate(`/chat/${defaultConversation.id}`, { replace: true });
            return;
          } else {
            throw new Error('Failed to create fallback conversation');
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Failed to load conversation");
        try {
          const fallbackConversation = await conversationService.createDefaultConversation();
          if (fallbackConversation) {
            navigate(`/chat/${fallbackConversation.id}`, { replace: true });
          } else {
            navigate("/");
          }
        } catch (fallbackError) {
          console.error("Error creating fallback conversation:", fallbackError);
          navigate("/");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initChat();
  }, [id, isAuthenticated, authLoading, navigate, location.pathname]);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  if (authLoading) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Header for mobile */}
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
          conversationId={id}
          conversation={conversation}
          messages={messages}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatPage;
