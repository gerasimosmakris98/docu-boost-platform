
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import StreamlinedChatInterface from "@/components/chat/StreamlinedChatInterface";
import UnifiedSidebar from "@/components/layout/UnifiedSidebar";
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
          // No conversation ID - show welcome state
          setConversation(null);
          setMessages([]);
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
          <p className="text-gray-400">Loading AI Career Advisor...</p>
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
      
      {/* Unified Sidebar */}
      <UnifiedSidebar 
        activeConversationId={id} 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      
      {/* Main chat area */}
      <div className={cn(
        "flex-1 flex flex-col h-full",
        isMobile && sidebarCollapsed && "pl-12 md:pl-0"
      )}>
        {id ? (
          <StreamlinedChatInterface 
            key={id}
            conversationId={id}
            conversation={conversation}
            messages={messages}
            isLoading={isLoading}
          />
        ) : (
          // Welcome state when no conversation is selected
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
              <div className="mb-8">
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  AI Career Advisor
                </h1>
                <p className="text-xl text-gray-400 mb-8">
                  Your intelligent career assistant powered by AI. Get personalized advice on resumes, interviews, job search strategies, and career development.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                <Button 
                  onClick={() => navigate('/chat')}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12"
                >
                  Start New Chat
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 h-12"
                >
                  View Profile
                </Button>
              </div>
              
              <p className="text-gray-500 mt-6 text-sm">
                Select an AI advisor from the sidebar or start a general conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
