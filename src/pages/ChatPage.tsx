
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import ModernChatSidebar from "@/components/chat/ModernChatSidebar";
import ModernChatInterface from "@/components/chat/ModernChatInterface";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Auto-collapse sidebar on mobile
    setSidebarCollapsed(isMobile);
  }, [isMobile]);
  
  useEffect(() => {
    const initChat = async () => {
      setIsLoading(true);
      
      if (!isAuthenticated) {
        // For non-authenticated users, redirect to auth
        navigate("/auth");
        return;
      }
      
      try {
        // Always create a new conversation when accessing /chat without ID or when user signs in
        if (!id || location.state?.createNew) {
          const newConversation = await conversationService.createDefaultConversation();
          if (newConversation) {
            navigate(`/chat/${newConversation.id}`, { replace: true });
            return;
          }
        }
        
        // If there's an ID in the URL, load that conversation
        if (id) {
          const { conversation: loadedConversation, messages: loadedMessages } = 
            await conversationService.getConversation(id);
          
          if (loadedConversation) {
            setConversation(loadedConversation);
            setMessages(loadedMessages);
            console.log(`ChatPage: Loaded conversation ${id} with ${loadedMessages.length} initial messages.`);
          } else {
            // If conversation not found, create a new one
            toast.error("Conversation not found");
            const defaultConversation = await conversationService.createDefaultConversation();
            if (defaultConversation) {
              navigate(`/chat/${defaultConversation.id}`, { replace: true });
            }
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Failed to load conversation");
      } finally {
        setIsLoading(false);
      }
    };
    
    initChat();
  }, [id, isAuthenticated, navigate, location.state]);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Header for mobile - only visible when sidebar is collapsed */}
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
      
      {/* Modern sidebar with AI Advisors */}
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
        <ModernChatInterface 
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
