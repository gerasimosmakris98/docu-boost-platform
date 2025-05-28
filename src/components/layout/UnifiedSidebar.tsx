
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
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UnifiedSidebarProps {
  activeConversationId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const advisors = [
  { id: 'general', name: 'Career Advisor', icon: <Bot className="h-4 w-4" /> },
  { id: 'resume', name: 'Resume Advisor', icon: <FileText className="h-4 w-4" /> },
  { id: 'interview', name: 'Interview Advisor', icon: <Users className="h-4 w-4" /> },
  { id: 'cover-letter', name: 'Cover Letter Advisor', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'job-search', name: 'Job Search Advisor', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'linkedin', name: 'LinkedIn Advisor', icon: <Linkedin className="h-4 w-4" /> },
  { id: 'assessment', name: 'Assessment Advisor', icon: <CheckSquare className="h-4 w-4" /> },
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
        {/* Header with AI Career Advisor branding */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  AI Career Advisor
                </h1>
                <p className="text-gray-400 text-xs">
                  Your AI Career Assistant
                </p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="text-gray-400 hover:text-white flex-shrink-0"
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
            <Button 
              onClick={() => handleCreateChat('general')}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {!isCollapsed && "New Chat"}
            </Button>
          </div>

          {/* AI Advisors */}
          {!isCollapsed && (
            <div className="px-3 py-2">
              <h2 className="text-xs font-semibold text-gray-400 mb-2">AI ADVISORS</h2>
              <div className="space-y-1">
                {advisors.map((advisor) => (
                  <Button
                    key={advisor.id}
                    variant="ghost"
                    className="w-full justify-start gap-2 h-8 px-2 text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => handleCreateChat(advisor.id)}
                  >
                    {advisor.icon}
                    <span className="text-sm">{advisor.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Chats */}
          <div className="flex-1 overflow-hidden">
            <div className={cn(
              "px-3 py-2 text-xs font-semibold text-gray-400 flex items-center",
              isCollapsed && "justify-center"
            )}>
              <Clock className="h-3 w-3 mr-1" />
              {!isCollapsed && "RECENT CHATS"}
            </div>
            
            <ScrollArea className="flex-1 px-1">
              <div className="space-y-0.5 px-2">
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
                        "flex items-center px-2 py-2 rounded text-sm hover:bg-gray-800/70 transition-colors",
                        activeConversationId === conversation.id 
                          ? "bg-gray-800 text-white" 
                          : "text-gray-400",
                        isCollapsed && "justify-center"
                      )}
                      onClick={() => isMobile && onToggleCollapse()}
                      title={isCollapsed ? conversation.title : undefined}
                    >
                      {isCollapsed ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <span className="truncate">{conversation.title}</span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Navigation */}
          {!isCollapsed && (
            <div className="px-3 py-2">
              <div className="space-y-1">
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center px-2 py-2 rounded text-sm transition-colors",
                    isActive("/profile")
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                  onClick={() => isMobile && onToggleCollapse()}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </div>
            </div>
          )}

          {/* User Info & Logout */}
          <div className="mt-auto border-t border-gray-800 p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium text-white leading-none">
                      {user?.user_metadata?.full_name || user?.email}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-8 w-8 text-gray-400 hover:text-red-400"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              {isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="h-8 w-8 text-gray-400 hover:text-red-400"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnifiedSidebar;
