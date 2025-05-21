
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bot,
  FileText, 
  MessageSquare, 
  Linkedin, 
  User, 
  Users, 
  Briefcase,
  CheckSquare,
  PlusCircle,
  Trash2,
  LogOut,
  Menu,
  Clock,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { conversationService, Conversation, ConversationType } from "@/services/conversationService";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

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

const advisors: Advisor[] = [
  {
    id: 'general',
    name: 'Career Advisor',
    type: 'general',
    icon: <Bot className="h-4 w-4" />,
    description: 'General career guidance'
  },
  {
    id: 'resume',
    name: 'Resume Advisor',
    type: 'resume',
    icon: <FileText className="h-4 w-4" />,
    description: 'Resume reviews and optimization'
  },
  {
    id: 'interview',
    name: 'Interview Advisor',
    type: 'interview_prep',
    icon: <Users className="h-4 w-4" />,
    description: 'Interview preparation and practice'
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter Advisor',
    type: 'cover_letter',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Cover letter writing assistance'
  },
  {
    id: 'job-search',
    name: 'Job Search Advisor',
    type: 'job_search',
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Job search strategy and advice'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Advisor',
    type: 'linkedin',
    icon: <Linkedin className="h-4 w-4" />,
    description: 'LinkedIn profile optimization'
  },
  {
    id: 'assessment',
    name: 'Assessment Advisor',
    type: 'assessment',
    icon: <CheckSquare className="h-4 w-4" />,
    description: 'Assessment preparation'
  },
];

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
          <div className="p-3 flex items-center justify-between border-b border-gray-800">
            <div className="font-semibold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              AI Career Advisor
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400" 
              onClick={onToggleCollapse}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="px-3 py-3">
            <Button 
              className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleCreateConversation(advisors[0])}
            >
              <PlusCircle className="h-4 w-4" />
              New Chat
            </Button>
          </div>
          
          <Separator className="bg-gray-800" />
          
          <div className="flex-1 overflow-hidden flex flex-col h-[calc(100%-170px)]">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400">
              AI ADVISORS
            </div>
            
            <ScrollArea className="px-3 py-1 flex-none">
              <div className="space-y-1">
                {advisors.map((advisor) => (
                  <Button
                    key={advisor.id}
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9 px-2 text-gray-300 hover:text-white"
                    onClick={() => handleCreateConversation(advisor)}
                  >
                    {advisor.icon}
                    <span>{advisor.name}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
            
            {conversations.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 flex items-center mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  RECENT CHATS
                </div>
                
                <ScrollArea className="flex-1 px-1">
                  <div className="space-y-1 px-2">
                    {isLoading ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        Loading...
                      </div>
                    ) : (
                      conversations.map((conversation) => (
                        <Link
                          key={conversation.id}
                          to={`/chat/${conversation.id}`}
                          className={cn(
                            "flex items-center justify-between px-2 py-1.5 rounded text-sm group hover:bg-gray-800/70",
                            activeConversationId === conversation.id 
                              ? "bg-gray-800 text-white" 
                              : "text-gray-400"
                          )}
                          onClick={() => isMobile && onToggleCollapse()}
                        >
                          <div className="flex items-center truncate">
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
                </ScrollArea>
              </>
            )}
          </div>
          
          <Separator className="bg-gray-800" />
          
          <div className="p-3 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-gray-400 hover:text-white"
                  onClick={() => navigate('/profile')}
                >
                  <User className="h-4 w-4" />
                  {user?.email ? (
                    <span className="truncate max-w-[120px] text-xs">{user.email}</span>
                  ) : (
                    <span>Profile</span>
                  )}
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop collapsed sidebar
  if (isCollapsed) {
    return (
      <div className="w-16 h-full bg-black border-r border-gray-800 flex flex-col">
        <div className="p-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-full mb-4" 
            onClick={onToggleCollapse}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="w-full mb-2 bg-green-600/10 border-green-500/20 hover:bg-green-600/20"
            onClick={() => handleCreateConversation(advisors[0])}
          >
            <PlusCircle className="h-5 w-5 text-green-500" />
          </Button>
        </div>
        
        <Separator className="bg-gray-800" />
        
        <div className="flex-1 overflow-y-auto py-2">
          <div className="space-y-2 px-2">
            {advisors.map((advisor) => (
              <Button
                key={advisor.id}
                variant="ghost"
                size="icon"
                className="w-full h-10"
                onClick={() => handleCreateConversation(advisor)}
                title={advisor.name}
              >
                {advisor.icon}
              </Button>
            ))}
          </div>
        </div>
        
        <Separator className="bg-gray-800" />
        
        <div className="p-2 mt-auto">
          <Button
            variant="ghost"
            size="icon"
            className="w-full mb-2"
            onClick={() => navigate('/profile')}
          >
            <User className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Desktop expanded sidebar
  return (
    <div className="w-64 h-full bg-black border-r border-gray-800 flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <div className="font-semibold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          AI Career Advisor
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onToggleCollapse}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="px-3 pb-3">
        <Button 
          className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => handleCreateConversation(advisors[0])}
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <Separator className="bg-gray-800" />
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-3 py-2 text-xs font-semibold text-gray-400">
          AI ADVISORS
        </div>
        
        <ScrollArea className="px-3 py-1 flex-none">
          <div className="space-y-1">
            {advisors.map((advisor) => (
              <Button
                key={advisor.id}
                variant="ghost"
                className="w-full justify-start gap-2 h-9 px-2 text-gray-300 hover:text-white"
                onClick={() => handleCreateConversation(advisor)}
              >
                {advisor.icon}
                <span>{advisor.name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
        
        {conversations.length > 0 && (
          <>
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 flex items-center mt-2">
              <Clock className="h-3 w-3 mr-1" />
              RECENT CHATS
            </div>
            
            <ScrollArea className="flex-1 px-1">
              <div className="space-y-1 px-2">
                {isLoading ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Loading...
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <Link
                      key={conversation.id}
                      to={`/chat/${conversation.id}`}
                      className={cn(
                        "flex items-center justify-between px-2 py-1.5 rounded text-sm group hover:bg-gray-800/70",
                        activeConversationId === conversation.id 
                          ? "bg-gray-800 text-white" 
                          : "text-gray-400"
                      )}
                    >
                      <div className="flex items-center truncate">
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
            </ScrollArea>
          </>
        )}
      </div>
      
      <Separator className="bg-gray-800" />
      
      <div className="p-3 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-gray-400 hover:text-white"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
              {user?.email ? (
                <span className="truncate max-w-[120px] text-xs">{user.email}</span>
              ) : (
                <span>Profile</span>
              )}
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModernChatSidebar;
