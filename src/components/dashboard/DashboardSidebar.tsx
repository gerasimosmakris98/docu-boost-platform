
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  User, 
  Home, 
  FileText, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Briefcase 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AdvisorList from "../advisor/AdvisorList";
import { conversationService } from "@/services/conversationService";

const DashboardSidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const startNewChat = async () => {
    try {
      toast.loading("Creating new conversation...");
      const conversation = await conversationService.createSpecializedConversation('general');
      
      if (conversation) {
        navigate(`/chat/${conversation.id}`);
        toast.dismiss();
      } else {
        toast.error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    }
  };

  return (
    <div className="w-64 border-r bg-background h-[calc(100vh-64px)] flex flex-col">
      <div className="p-4">
        <Button 
          variant="default" 
          className="w-full justify-start gap-2" 
          onClick={startNewChat}
        >
          <MessageSquare className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        <Link
          to="/"
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium",
            isActive("/") && !isActive("/profile") && !isActive("/conversations") && !isActive("/chat")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Link>

        <Link
          to="/chat"
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium",
            isActive("/chat") || isActive("/conversations")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Conversations
        </Link>

        <div>
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
            AI ADVISORS
          </div>
          <AdvisorList />
        </div>

        <Link
          to="/profile"
          className={cn(
            "flex items-center px-3 py-2 rounded-md text-sm font-medium",
            isActive("/profile")
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Link>

        <div className="mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default DashboardSidebar;
