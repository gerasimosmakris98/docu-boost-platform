
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation } from "@/services/conversationService";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import ConversationList from "./components/ConversationList";

interface ModernChatSidebarProps {
  activeConversationId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ModernChatSidebar = ({ 
  activeConversationId, 
  isCollapsed, 
  onToggleCollapse 
}: ModernChatSidebarProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await conversationService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      // Navigate to new chat page for advisor selection
      navigate("/new-chat");
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-black border-r border-gray-800 transition-all duration-300",
        "lg:relative lg:z-auto",
        isCollapsed 
          ? "w-16 lg:w-16" 
          : "w-80 lg:w-80",
        isMobile && isCollapsed && "w-0 overflow-hidden"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm">Career Advisor</h1>
                <p className="text-gray-400 text-xs">
                  Welcome, {user?.user_metadata?.full_name || 'User'}
                </p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-white flex-shrink-0"
            aria-expanded={!isCollapsed}
            aria-label={
              isMobile 
                ? (isCollapsed ? "Open chat menu" : "Close chat menu") 
                : (isCollapsed ? "Expand chat sidebar" : "Collapse chat sidebar")
            }
          >
            {isMobile ? (
              isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />
            ) : (
              isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Conversations List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent"></div>
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            onCreateNew={handleCreateNew}
            isCollapsed={isCollapsed}
          />
        )}
      </div>
    </>
  );
};

export default ModernChatSidebar;
