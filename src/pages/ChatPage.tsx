
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import ModernChatSidebar from "@/components/chat/ModernChatSidebar";
import ModernChatInterface from "@/components/chat/ModernChatInterface";
import { toast } from "sonner";

const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
            role: 'assistant',
            content: "Hello! I'm your AI career assistant. Sign in to get personalized help with your resume, interview preparation, and job search strategies.",
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
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Modern sidebar with AI Advisors */}
      <ModernChatSidebar 
        activeConversationId={id} 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        <ModernChatInterface 
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
