
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import ModernChatSidebar from "@/components/chat/ModernChatSidebar";
import ModernChatInterface from "@/components/chat/ModernChatInterface";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    // Always start by attempting to load or create a conversation
    const initChat = async () => {
      setIsLoading(true);
      
      if (!isAuthenticated) {
        // For non-authenticated users, show a preview conversation
        setConversation(null);
        setMessages([
          {
            id: "preview-1",
            conversation_id: "preview",
            role: 'assistant',
            content: "Hello! I'm your AI career assistant. Sign in to get personalized help with your career journey.",
            created_at: new Date().toISOString()
          }
        ]);
        setIsLoading(false);
        return;
      }
      
      try {
        // If there's an ID in the URL, load that conversation
        if (id) {
          const { conversation: loadedConversation, messages: loadedMessages } = 
            await conversationService.getConversation(id);
          
          if (loadedConversation) {
            setConversation(loadedConversation);
            setMessages(loadedMessages);
            console.log(`ChatPage: Loaded conversation ${id} with ${loadedMessages.length} initial messages.`);
          } else {
            // If conversation not found, redirect to default
            toast.error("Conversation not found");
            const defaultConversation = await conversationService.createDefaultConversation();
            if (defaultConversation) {
              navigate(`/chat/${defaultConversation.id}`, { replace: true });
            }
          }
        } else {
          // If no ID, create or load a default conversation
          const defaultConversation = await conversationService.createDefaultConversation();
          if (defaultConversation) {
            navigate(`/chat/${defaultConversation.id}`, { replace: true });
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
  }, [id, isAuthenticated, navigate]);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
      {isMobile && sidebarCollapsed && (
        <div className="fixed top-0 left-0 z-50 p-4">
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
      
      {/* Main chat area - Add padding-top on mobile to prevent header overlap */}
      <div className={`flex-1 flex flex-col h-full ${isMobile && sidebarCollapsed ? 'pt-14' : ''}`}>
        <ModernChatInterface 
          key={id} // Add key prop here
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
