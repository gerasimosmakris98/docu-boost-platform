import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  User, 
  Home, 
  MessageSquare, 
  LogOut,
  Plus,
  X,
  Users // Assuming Users icon for Advisors or similar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AdvisorList from '@/components/advisor/AdvisorList';
import ConversationHistoryList from '@/components/common/ConversationHistoryList.tsx';
import { useMediaQuery } from '@/hooks/use-media-query';
import { toast } from "sonner";
import { conversationService } from "@/services/conversationService"; // For fetching conversations
import { useEffect, useState } from "react";
import { Conversation } from "@/services/conversationService";

interface AppSidebarProps {
  setSidebarOpen: (open: boolean) => void;
}

const AppSidebar = ({ setSidebarOpen }: AppSidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;
      setIsLoadingConversations(true);
      try {
        const userConversations = await conversationService.getUserConversations();
        setConversations(userConversations || []);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        toast.error("Failed to load recent conversations.");
        setConversations([]);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user]);
  
  const isActive = (path: string) => {
    // Handle dashboard ("/") specially to avoid matching all paths
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/auth'); // Navigate to auth page after logout
    toast.success("Logged out successfully");
  };

  const handleNewChat = () => {
    navigate('/new-chat');
    if (!isDesktop) {
      setSidebarOpen(false); // Close sidebar on mobile after navigation
    }
  };

  const handleProfile = () => {
    navigate('/profile');
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };
  
  let initials = 'U'; // Default fallback
  const fullName = user?.user_metadata?.full_name;
  const email = user?.email;

  if (fullName && typeof fullName === 'string' && fullName.trim().length > 0) {
    const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0); // Split by space(s) and remove empty parts
    
    if (nameParts.length >= 2) {
      initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      initials = nameParts[0][0].toUpperCase();
    }
    // If nameParts is empty after trim/split/filter (e.g., full_name was just spaces), it will fall through to email or default 'U'
  } else if (email && typeof email === 'string' && email.trim().length > 0) {
    initials = email.trim()[0].toUpperCase();
  }

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Sidebar Header */}
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <MessageSquare className="h-6 w-6 text-primary" /> {/* Placeholder Icon */}
          <span className="">AI Platform</span>
        </Link>
        {isDesktop && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Main Content of Sidebar */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        <Button 
          variant="default" 
          className="w-full justify-start gap-2" 
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>

        <nav className="space-y-1">
          <Link
            to="/"
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium",
              isActive("/")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => !isDesktop && setSidebarOpen(false)}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>

          <Link
            to="/conversations"
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium",
              isActive("/conversations") || isActive("/chat") // Keep conversations active for /chat/:id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => !isDesktop && setSidebarOpen(false)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Conversations
          </Link>

          <Link
            to="/profile"
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm font-medium",
              isActive("/profile")
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => !isDesktop && setSidebarOpen(false)}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </nav>
        
        {/* AI Advisors Section */}
        <div className="pt-2">
          <h2 className="px-3 py-2 text-xs font-semibold text-muted-foreground">AI ADVISORS</h2>
          <AdvisorList />
        </div>
        
        {/* Conversation History */}
        <div className="pt-2">
          <h2 className="px-3 py-2 text-xs font-semibold text-muted-foreground">RECENT</h2>
          {isLoadingConversations ? (
            <p className="px-3 text-sm text-muted-foreground">Loading conversations...</p>
          ) : (
            <ConversationList
              conversations={conversations}
              activeConversationId={location.pathname.split("/").pop()} // Basic active ID detection
              onCreateNew={handleNewChat}
              // isCollapsed will be handled by ConversationHistoryList itself if needed, or via prop
            />
          )}
        </div>
      </div>
      
      {/* Sidebar Footer: User Info & Logout */}
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 truncate">
            <p className="text-sm font-medium leading-none">{user?.user_metadata?.full_name || user?.email}</p>
            {user?.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleProfile}>
                  <User className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Profile</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Sign out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
