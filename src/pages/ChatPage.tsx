
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatInterface from "@/components/chat/ChatInterface";
import { toast } from "sonner";
import { Plus, Menu } from "lucide-react";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
            role: "assistant",
            content: "Hello! I'm your AI career assistant. Sign in to get personalized help with your resume, interview preparation, and job search.",
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
          } else {
            // If conversation not found, redirect to default
            toast.error("Conversation not found");
            const defaultConversation = await conversationService.createDefaultConversation();
            if (defaultConversation) {
              navigate(`/chat/${defaultConversation.id}`);
            }
          }
        } else {
          // If no ID, create or load a default conversation
          const defaultConversation = await conversationService.createDefaultConversation();
          if (defaultConversation) {
            navigate(`/chat/${defaultConversation.id}`);
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
  
  const handleCreateNewChat = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to create a new conversation");
      navigate("/auth");
      return;
    }
    
    try {
      toast.loading("Creating new conversation...");
      const newConversation = await conversationService.createSpecializedConversation('general');
      
      if (newConversation) {
        navigate(`/chat/${newConversation.id}`);
        toast.dismiss();
        toast.success("New conversation created");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Mobile sidebar toggle */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden absolute top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full max-w-xs`}>
        <ChatSidebar 
          activeConversationId={id} 
          onNewChat={handleCreateNewChat}
        />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        <ChatInterface 
          conversationId={id}
          conversation={conversation}
          messages={messages}
          isLoading={isLoading}
        />
      </div>
      
      {/* Mobile new chat button */}
      <Button 
        size="icon" 
        className="lg:hidden fixed bottom-4 right-4 rounded-full w-12 h-12 bg-green-500 hover:bg-green-600 shadow-lg"
        onClick={handleCreateNewChat}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default ChatPage;
