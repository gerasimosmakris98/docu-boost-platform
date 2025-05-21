
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { conversationService, Conversation, ConversationType } from "@/services/conversationService";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarGroups from "./sidebar/SidebarGroups";
import SidebarFooter from "./sidebar/SidebarFooter";

interface ModernChatSidebarProps {
  activeConversationId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface Advisor {
  id: string;
  name: string;
  type: ConversationType;
  icon: React.ReactNode;
  description: string;
}

const ModernChatSidebar = ({ 
  activeConversationId, 
  isCollapsed,
  onToggleCollapse
}: ModernChatSidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const data = await conversationService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  const handleCreateConversation = async (advisor: Advisor) => {
    try {
      toast.loading(`Starting conversation with ${advisor.name}...`);
      const conversation = await conversationService.createSpecializedConversation(advisor.type);
      
      if (conversation) {
        navigate(`/chat/${conversation.id}`);
        toast.dismiss();
        toast.success(`Started conversation with ${advisor.name}`);
        
        // Automatically collapse sidebar on mobile after creating new conversation
        if (isMobile && !isCollapsed) {
          onToggleCollapse();
        }
      } else {
        toast.error("Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        await conversationService.deleteConversation(id);
        setConversations(prev => prev.filter(conv => conv.id !== id));
        
        if (id === activeConversationId) {
          // Navigate to a different conversation or create a new one
          if (conversations.length > 1) {
            const nextConversation = conversations.find(c => c.id !== id);
            if (nextConversation) {
              navigate(`/chat/${nextConversation.id}`);
              return;
            }
          }
          
          // No other conversations, create a new one
          const newConversation = await conversationService.createSpecializedConversation('general');
          if (newConversation) {
            navigate(`/chat/${newConversation.id}`);
          }
        }
        
        toast.success("Conversation deleted");
      } catch (error) {
        console.error("Error deleting conversation:", error);
        toast.error("Failed to delete conversation");
      }
    }
  };

  // Mobile sidebar with overlay
  if (isMobile) {
    // If sidebar is collapsed on mobile, render a minimal sidebar
    if (isCollapsed) {
      return null; // Don't render the sidebar when collapsed on mobile - we use the menu button in ChatPage
    }
    
    // Full mobile sidebar with overlay
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="absolute inset-0" onClick={onToggleCollapse}></div>
        <div className="relative h-full w-80 bg-black border-r border-gray-800 animate-in slide-in-from-left">
          <SidebarHeader 
            isCollapsed={false} 
            onToggleCollapse={onToggleCollapse} 
            onNewChat={() => handleCreateConversation({
              id: 'general',
              name: 'Career Advisor',
              type: 'general',
              icon: null,
              description: ''
            })} 
          />
          
          <Separator className="bg-gray-800" />
          
          <SidebarGroups
            conversations={conversations}
            activeConversationId={activeConversationId}
            isCollapsed={false}
            isLoading={isLoading}
            onToggleCollapse={onToggleCollapse}
            onConversationDelete={handleDeleteConversation}
            handleCreateConversation={handleCreateConversation}
          />
          
          <Separator className="bg-gray-800" />
          
          <SidebarFooter isCollapsed={false} onLogout={handleLogout} />
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full bg-black border-r border-gray-800 flex flex-col transition-width duration-300`}>
      <SidebarHeader 
        isCollapsed={isCollapsed} 
        onToggleCollapse={onToggleCollapse} 
        onNewChat={() => handleCreateConversation({
          id: 'general',
          name: 'Career Advisor',
          type: 'general',
          icon: null,
          description: ''
        })} 
      />
      
      <Separator className="bg-gray-800" />
      
      <SidebarGroups
        conversations={conversations}
        activeConversationId={activeConversationId}
        isCollapsed={isCollapsed}
        isLoading={isLoading}
        onToggleCollapse={onToggleCollapse}
        onConversationDelete={handleDeleteConversation}
        handleCreateConversation={handleCreateConversation}
      />
      
      <Separator className="bg-gray-800" />
      
      <SidebarFooter isCollapsed={isCollapsed} onLogout={handleLogout} />
    </div>
  );
};

export default ModernChatSidebar;
