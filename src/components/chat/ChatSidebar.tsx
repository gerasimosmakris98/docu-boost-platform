
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Plus, 
  User, 
  LogOut,
  Trash2,
  Clock
} from "lucide-react";
import { conversationService, Conversation } from "@/services/conversationService";

interface ChatSidebarProps {
  activeConversationId?: string;
  onNewChat: () => Promise<void>;
}

const ChatSidebar = ({ activeConversationId, onNewChat }: ChatSidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);
  
  const handleLogout = async () => {
    await logout();
    navigate("/auth");
    toast.success("Logged out successfully");
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
          onNewChat();
        }
        
        toast.success("Conversation deleted");
      } catch (error) {
        console.error("Error deleting conversation:", error);
        toast.error("Failed to delete conversation");
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800">
      <div className="p-4">
        <Button 
          className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700 text-white"
          onClick={onNewChat}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-center py-4 text-gray-400">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-4 text-gray-400">
              No conversations yet
            </div>
          ) : (
            conversations.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/chat/${conversation.id}`}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm group",
                  activeConversationId === conversation.id 
                    ? "bg-gray-800 text-white" 
                    : "text-gray-300 hover:bg-gray-800/50"
                )}
              >
                <div className="flex items-center truncate">
                  <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{conversation.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  title="Delete conversation"
                >
                  <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-400" />
                </Button>
              </Link>
            ))
          )}
        </div>
      </div>
      
      <div className="p-4 mt-auto">
        <div className="flex flex-col space-y-2">
          <Separator className="bg-gray-800" />
          
          <Link to="/profile" className="flex items-center px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800/50">
            <User className="mr-2 h-4 w-4" />
            {user?.email ? (
              <span className="truncate">{user.email}</span>
            ) : (
              <span>Profile</span>
            )}
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-gray-300 hover:bg-gray-800/50 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
