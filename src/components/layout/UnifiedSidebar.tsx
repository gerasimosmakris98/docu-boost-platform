
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation } from "@/services/conversationService";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Menu, 
  X, 
  Plus,
  User, 
  LogOut,
  MessageSquare,
  Bot,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface UnifiedSidebarProps {
  activeConversationId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const UnifiedSidebar = ({ 
  activeConversationId, 
  isCollapsed, 
  onToggleCollapse 
}: UnifiedSidebarProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleCreateChat = async () => {
    try {
      const conversation = await conversationService.createSpecializedConversation('general');
      if (conversation) {
        navigate(`/chat/${conversation.id}`);
        if (isMobile) onToggleCollapse();
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create new chat");
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
    toast.success("Logged out successfully");
  };

  // Get user initials
  let initials = 'U';
  const fullName = user?.user_metadata?.full_name;
  const email = user?.email;

  if (fullName && typeof fullName === 'string' && fullName.trim().length > 0) {
    const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
    if (nameParts.length >= 2) {
      initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      initials = nameParts[0][0].toUpperCase();
    }
  } else if (email && typeof email === 'string' && email.trim().length > 0) {
    initials = email.trim()[0].toUpperCase();
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}
      
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isCollapsed ? (isMobile ? 0 : 60) : 280 
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-white/10 transition-all duration-200 overflow-hidden",
          "lg:relative lg:z-auto",
          "bg-black/80 backdrop-blur-xl",
          isMobile && isCollapsed && "w-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 h-16">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-0.5 -right-0.5"
                  >
                    <Sparkles className="h-2.5 w-2.5 text-cyan-300" />
                  </motion.div>
                </div>
                <div>
                  <h1 className="text-white font-semibold text-sm">
                    AI Career Advisor
                  </h1>
                  <p className="text-gray-400 text-xs">
                    Your Career Assistant
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
          >
            {isMobile ? (
              isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />
            ) : (
              isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* New Chat Button */}
          <div className="p-3">
            <Button 
              onClick={handleCreateChat}
              className={cn(
                "w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white",
                isCollapsed && "p-2"
              )}
              size={isCollapsed ? "icon" : "default"}
            >
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">New Chat</span>}
            </Button>
          </div>

          {/* Recent Chats */}
          <div className="flex-1 overflow-hidden">
            <div className={cn(
              "px-3 py-2 text-xs font-semibold text-gray-400",
              isCollapsed && "text-center"
            )}>
              {!isCollapsed && "RECENT CHATS"}
            </div>
            
            <ScrollArea className="flex-1 px-1">
              <div className="space-y-1 px-2">
                {isLoading ? (
                  <div className={cn("text-center py-4 text-gray-500 text-sm", isCollapsed && "hidden")}>
                    Loading...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className={cn("text-center py-4 text-gray-500 text-sm", isCollapsed && "hidden")}>
                    No recent chats
                  </div>
                ) : (
                  conversations.slice(0, 10).map((conversation) => (
                    <Link
                      key={conversation.id}
                      to={`/chat/${conversation.id}`}
                      className={cn(
                        "flex items-center px-2 py-2 rounded text-sm hover:bg-white/10 transition-all duration-200",
                        activeConversationId === conversation.id 
                          ? "bg-white/10 text-white" 
                          : "text-gray-400 hover:text-white",
                        isCollapsed && "justify-center"
                      )}
                      onClick={() => isMobile && onToggleCollapse()}
                      title={isCollapsed ? conversation.title : undefined}
                    >
                      {isCollapsed ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span className="truncate">
                            {conversation.title}
                          </span>
                        </>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Profile Navigation */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="px-3 py-2"
              >
                <Link
                  to="/profile"
                  className="flex items-center px-3 py-2 rounded text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                  onClick={() => isMobile && onToggleCollapse()}
                >
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Profile */}
          {isCollapsed && (
            <div className="px-2 py-2">
              <Link
                to="/profile"
                className="flex items-center justify-center p-2 rounded text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                onClick={() => isMobile && onToggleCollapse()}
                title="Profile"
              >
                <User className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* User Info & Logout */}
          <div className="mt-auto border-t border-white/10 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 ring-2 ring-cyan-500/30">
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 truncate"
                  >
                    <p className="text-sm font-medium text-white leading-none">
                      {user?.user_metadata?.full_name || user?.email}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UnifiedSidebar;
