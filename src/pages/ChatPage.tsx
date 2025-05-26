
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
  const [isLoading, setIsLoading] = useState(true); // This might be consolidated or used for specific chat actions
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);
  
  useEffect(() => {
    const initChat = async () => {
      console.log("initChat triggered. ID:", id, "isInitializing:", isInitializing, "authLoading:", authLoading, "isAuthenticated:", isAuthenticated);
      // Entry guard: If already initializing (e.g. due to a previous async operation from this effect), don't re-trigger.
      // This simple check might need refinement with a ref for very first run if issues persist.
      if (isInitializing && conversation) { 
        console.log("Already initializing and conversation is present, returning early.");
        return;
      }

      setIsInitializing(true);
      setInitializationError(null);
      setIsLoading(true); // Keep this for now, might be useful for StreamlinedChatInterface

      if (authLoading) {
        console.log("Auth is loading, waiting...");
        // No need to set isInitializing to false here, as we want to show "Initializing chat..."
        return;
      }

      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to /auth");
        navigate("/auth", { state: { from: location.pathname } });
        setIsInitializing(false);
        setIsLoading(false);
        return;
      }

      try {
        if (!id) {
          console.log("No conversation ID, navigating to /new-chat.");
          navigate("/new-chat", { replace: true });
          return;
        }

        console.log("Attempting to load conversation with ID:", id);
        const { conversation: loadedConversation, messages: loadedMessages } =
          await conversationService.getConversation(id);

        if (loadedConversation) {
          console.log(`Loaded conversation: ${loadedConversation.title} with ${loadedMessages.length} messages`);
          setConversation(loadedConversation);
          setMessages(loadedMessages);
          console.log("Conversation loaded successfully.");
        } else {
          console.log("Conversation not found for ID:", id, "Attempting to create a new one by navigating to /chat");
          setInitializationError("Chat session not found. Starting a new one.");
          // Navigate to /chat which should re-trigger this effect without an ID, leading to creation.
          navigate("/chat", { replace: true }); 
          // Return to let the navigation take effect and re-run the hook.
          return;
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        setInitializationError("Failed to load chat. Please try again later.");
        // Consider navigating to a general error page or home
        // navigate("/"); // Example: fallback to home on critical error
      } finally {
        // setIsLoading(false); // isLoading might be used by StreamlinedChatInterface for its own loading state
        setIsInitializing(false);
      }
    };

    initChat();
  }, [id, isAuthenticated, authLoading, navigate, location.pathname, isInitializing, conversation]); // Added isInitializing and conversation to deps for the entry guard

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (isInitializing || authLoading) { // Show loading if page is initializing OR auth is still loading
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Initializing chat...</p>
        </div>
      </div>
    );
  }

  if (initializationError) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center p-4">
        <div className="text-center space-y-4 bg-gray-800 p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold text-red-500">Initialization Error</h2>
          <p className="text-gray-300">{initializationError}</p>
          <Button
            onClick={() => {
              setInitializationError(null);
              setIsInitializing(true); // Re-trigger initialization
              // Navigate to a clean state that should re-run useEffect properly
              if (id) navigate(`/chat/${id}`, { replace: true }); // try current chat again
              else navigate("/chat", { replace: true }); // or attempt new chat
            }}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-green-500 text-green-500 hover:bg-green-700 hover:text-white"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }
  
  // Only render chat interface if no errors and initialization is complete
  if (!isInitializing && !initializationError && conversation) {
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
              aria-label="Open chat navigation" // Added aria-label
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
          isMobile && sidebarCollapsed && "pl-12 md:pl-0" // Adjust padding if sidebar is collapsed on mobile
        )}>
          <StreamlinedChatInterface 
            key={id} // Ensure re-mount when ID changes
            conversationId={id!} // id should be present here
            conversation={conversation}
            messages={messages}
            isLoading={isLoading} // This isLoading is now distinct from page initialization
          />
        </div>
      </div>
    );
  }

  // Fallback for unexpected states, though ideally covered by above conditions
  // This might indicate a state where conversation is null AFTER initialization without error
  // which could happen if navigation from creation path doesn't immediately cause a re-render with new ID.
  // Or if /chat navigation doesn't lead to creation.
  return (
    <div className="flex h-screen bg-black text-white items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-gray-400">Loading chat...</p> 
        {/* A more generic loading or a redirect might be better here */}
      </div>
    </div>
  );
};

export default ChatPage;
