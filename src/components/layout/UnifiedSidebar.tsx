
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { conversationService, Conversation } from "@/services/conversationService";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  ChevronLeft, 
  Menu, 
  X, 
  Plus,
  User, 
  LogOut,
  MessageSquare,
  Bot,
  Sparkles,
  Settings,
  FileText,
  Users,
  Linkedin,
  Briefcase,
  CheckSquare
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
  {
    id: 'general',
    name: 'Career Advisor',
    type: 'general' as const,
    icon: <Bot className="h-4 w-4" />,
    description: 'General career guidance and advice'
  },
  {
    id: 'resume',
    name: 'Resume Advisor',
    type: 'resume' as const,
    icon: <FileText className="h-4 w-4" />,
    description: 'Resume reviews and optimization'
  },
  {
    id: 'interview',
    name: 'Interview Advisor',
    type: 'interview_prep' as const,
    icon: <Users className="h-4 w-4" />,
    description: 'Interview preparation and practice'
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter Advisor',
    type: 'cover_letter' as const,
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Cover letter writing assistance'
  },
  {
    id: 'job-search',
    name: 'Job Search Advisor',
    type: 'job_search' as const,
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Job search strategy and advice'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Advisor',
    type: 'linkedin' as const,
    icon: <Linkedin className="h-4 w-4" />,
    description: 'LinkedIn profile optimization'
  },
  {
    id: 'assessment',
    name: 'Assessment Advisor',
    type: 'assessment' as const,
    icon: <CheckSquare className="h-4 w-4" />,
    description: 'Assessment preparation'
  },
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

  const handleCreateConversation = async (advisor: typeof advisors[0]) => {
    try {
      const conversation = await conversationService.createSpecializedConversation(advisor.type);
      if (conversation) {
        navigate(`/chat/${conversation.id}`);
        if (isMobile) onToggleCollapse();
        toast.success(`Started conversation with ${advisor.name}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create new conversation");
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
    toast.success("Logged out successfully");
  };

  const handleProfileSettings = () => {
    navigate('/profile');
    if (isMobile) onToggleCollapse();
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
      {/* Mobile overlay - Completely invisible but functional */}
      {isMobile && !isCollapsed && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'transparent' }}
          onClick={onToggleCollapse}
        />
      )}
      
      {/* Sidebar - Responsive widths with no dark backgrounds */}
      <motion.div 
        initial={false}
        animate={{ 
          width: isCollapsed 
            ? (isMobile ? 0 : 64) 
            : isMobile 
              ? '100vw' 
              : window.innerWidth >= 1024 
                ? 320 
                : window.innerWidth >= 768 
                  ? 280 
                  : '100vw'
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-white/20 transition-all duration-200 overflow-hidden",
          "lg:relative lg:z-auto",
          "bg-transparent",
          isMobile && isCollapsed && "w-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 h-16 bg-transparent">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <div className="relative flex-shrink-0">
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
                <div className="min-w-0 flex-1">
                  <h1 className="text-white font-semibold text-base truncate">
                    AI Career Advisor
                  </h1>
                  <p className="text-gray-300 text-sm truncate">
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
            className="text-gray-300 hover:text-white hover:bg-white/10 h-11 w-11 min-h-[44px] min-w-[44px] flex-shrink-0"
          >
            {isMobile ? (
              isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />
            ) : (
              isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100vh-64px)] bg-transparent">
          {/* AI Advisors Section */}
          <div className="p-4 flex-shrink-0">
            <div className={cn(
              "text-xs font-semibold text-gray-300 mb-3",
              isCollapsed && "text-center"
            )}>
              {!isCollapsed ? "AI ADVISORS" : "AI"}
            </div>
            
            <div className="space-y-1">
              {advisors.map((advisor) => (
                <Button
                  key={advisor.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 text-gray-200 hover:text-white hover:bg-white/10 min-h-[44px] transition-all duration-200",
                    isCollapsed && "justify-center px-2"
                  )}
                  onClick={() => handleCreateConversation(advisor)}
                  title={isCollapsed ? advisor.name : undefined}
                >
                  {advisor.icon}
                  {!isCollapsed && <span className="text-sm truncate">{advisor.name}</span>}
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Chats Section */}
          <div className="flex-1 overflow-hidden min-h-0">
            <div className={cn(
              "px-4 py-2 text-xs font-semibold text-gray-300 flex-shrink-0",
              isCollapsed && "text-center"
            )}>
              {!isCollapsed ? "RECENT CHATS" : "CHAT"}
            </div>
            
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1 px-2 pb-4">
                {isLoading ? (
                  <div className={cn("text-center py-4 text-gray-400 text-sm", isCollapsed && "hidden")}>
                    Loading...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className={cn("text-center py-4 text-gray-400 text-sm", isCollapsed && "hidden")}>
                    No recent chats
                  </div>
                ) : (
                  conversations.slice(0, 10).map((conversation) => (
                    <Link
                      key={conversation.id}
                      to={`/chat/${conversation.id}`}
                      className={cn(
                        "flex items-center px-3 py-3 rounded-lg text-sm hover:bg-white/10 transition-all duration-200 min-h-[44px] group",
                        activeConversationId === conversation.id 
                          ? "bg-white/10 text-white" 
                          : "text-gray-300 hover:text-white",
                        isCollapsed && "justify-center px-2"
                      )}
                      onClick={() => isMobile && onToggleCollapse()}
                      title={isCollapsed ? conversation.title : undefined}
                    >
                      {isCollapsed ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
                          <span className="truncate flex-1">
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

          {/* User Info & Settings - Fixed profile dropdown */}
          <div className="mt-auto border-t border-white/20 p-4 bg-transparent flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-cyan-500/30 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold">
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
                    className="flex-1 truncate min-w-0"
                  >
                    <p className="text-sm font-medium text-white leading-none truncate">
                      {user?.user_metadata?.full_name || user?.email}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-gray-300 truncate">{user.email}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-gray-300 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] flex-shrink-0"
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-white/10 backdrop-blur-md border-white/20 z-[100] shadow-xl"
                  sideOffset={8}
                >
                  <DropdownMenuItem 
                    onClick={handleProfileSettings} 
                    className="text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer h-11 min-h-[44px] focus:bg-white/10 focus:text-white"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer h-11 min-h-[44px] focus:bg-red-500/10 focus:text-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UnifiedSidebar;
