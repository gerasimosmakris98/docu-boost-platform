
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation } from "@/services/conversationService";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  Plus,
  User, 
  LogOut,
  MessageSquare,
  Bot,
  FileText,
  Users,
  Briefcase,
  Linkedin,
  CheckSquare,
  Clock,
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

const advisors = [
  { id: 'general', name: 'Career Advisor', icon: <Bot className="h-4 w-4" />, color: 'from-cyan-500 to-blue-500' },
  { id: 'resume', name: 'Resume Advisor', icon: <FileText className="h-4 w-4" />, color: 'from-green-500 to-emerald-500' },
  { id: 'interview', name: 'Interview Advisor', icon: <Users className="h-4 w-4" />, color: 'from-purple-500 to-pink-500' },
  { id: 'cover-letter', name: 'Cover Letter Advisor', icon: <MessageSquare className="h-4 w-4" />, color: 'from-orange-500 to-red-500' },
  { id: 'job-search', name: 'Job Search Advisor', icon: <Briefcase className="h-4 w-4" />, color: 'from-indigo-500 to-purple-500' },
  { id: 'linkedin', name: 'LinkedIn Advisor', icon: <Linkedin className="h-4 w-4" />, color: 'from-blue-600 to-blue-700' },
  { id: 'assessment', name: 'Assessment Advisor', icon: <CheckSquare className="h-4 w-4" />, color: 'from-teal-500 to-cyan-500' },
];

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

  const handleCreateChat = async (advisorType = 'general') => {
    try {
      const conversation = await conversationService.createSpecializedConversation(advisorType as any);
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

  const isActive = (path: string) => {
    if (path === "/chat") {
      return location.pathname === path || location.pathname.startsWith('/chat');
    }
    return location.pathname === path;
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
          width: isCollapsed ? (isMobile ? 0 : 64) : 320 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-white/10 transition-all duration-300 overflow-hidden",
          "lg:relative lg:z-auto",
          "bg-gradient-to-b from-slate-900/95 to-black/95 backdrop-blur-xl",
          isMobile && isCollapsed && "w-0"
        )}
      >
        {/* Header with AI Career Advisor branding */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="h-3 w-3 text-cyan-300" />
                  </motion.div>
                </div>
                <div>
                  <h1 className="text-white font-semibold text-sm bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    AI Career Advisor
                  </h1>
                  <p className="text-gray-400 text-xs">
                    Your AI Career Assistant
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-white hover:bg-white/10 flex-shrink-0"
          >
            {isMobile ? (
              isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />
            ) : (
              isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100vh-64px)]">
          {/* New Chat Button */}
          <div className="p-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => handleCreateChat('general')}
                className={cn(
                  "w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg",
                  isCollapsed && "p-2"
                )}
              >
                <Plus className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">New Chat</span>}
              </Button>
            </motion.div>
          </div>

          {/* AI Advisors */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-3 py-2"
              >
                <h2 className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Bot className="h-3 w-3" />
                  AI ADVISORS
                </h2>
                <div className="space-y-1">
                  {advisors.map((advisor) => (
                    <motion.div
                      key={advisor.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-9 px-3 text-gray-300 hover:text-white hover:bg-white/10 group"
                        onClick={() => handleCreateChat(advisor.id)}
                      >
                        <div className={cn("p-1 rounded bg-gradient-to-r", advisor.color)}>
                          {advisor.icon}
                        </div>
                        <span className="text-sm group-hover:text-white transition-colors">
                          {advisor.name}
                        </span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Chats */}
          <div className="flex-1 overflow-hidden">
            <div className={cn(
              "px-3 py-2 text-xs font-semibold text-gray-400 flex items-center gap-2",
              isCollapsed && "justify-center px-2"
            )}>
              <Clock className="h-3 w-3" />
              {!isCollapsed && "RECENT CHATS"}
            </div>
            
            <ScrollArea className="flex-1 px-1">
              <div className="space-y-0.5 px-2">
                {isLoading ? (
                  <div className={cn("text-center py-4 text-gray-500 text-sm", isCollapsed && "hidden")}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-gray-600 border-t-cyan-400 rounded-full mx-auto mb-2"
                    />
                    Loading...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className={cn("text-center py-4 text-gray-500 text-sm", isCollapsed && "hidden")}>
                    No recent chats
                  </div>
                ) : (
                  conversations.slice(0, 10).map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={`/chat/${conversation.id}`}
                        className={cn(
                          "flex items-center px-2 py-2 rounded text-sm hover:bg-white/10 transition-all duration-200 group",
                          activeConversationId === conversation.id 
                            ? "bg-white/10 text-white shadow-lg" 
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
                            <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0 group-hover:text-cyan-400 transition-colors" />
                            <span className="truncate group-hover:text-white transition-colors">
                              {conversation.title}
                            </span>
                          </>
                        )}
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Navigation with Profile Icon */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-3 py-2"
              >
                <div className="space-y-1">
                  <motion.div whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/profile"
                      className={cn(
                        "flex items-center px-3 py-2 rounded text-sm transition-all duration-200 group",
                        isActive("/profile")
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/10"
                      )}
                      onClick={() => isMobile && onToggleCollapse()}
                    >
                      <User className="h-4 w-4 mr-3 group-hover:text-cyan-400 transition-colors" />
                      Profile
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Navigation with Profile Icon */}
          {isCollapsed && (
            <div className="px-2 py-2">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center justify-center p-2 rounded text-sm transition-all duration-200",
                    isActive("/profile")
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  )}
                  onClick={() => isMobile && onToggleCollapse()}
                  title="Profile"
                >
                  <User className="h-4 w-4" />
                </Link>
              </motion.div>
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
                    transition={{ duration: 0.2 }}
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
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UnifiedSidebar;
