
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface SidebarFooterProps {
  isCollapsed: boolean;
  onLogout: () => void;
}

const SidebarFooter = ({ isCollapsed, onLogout }: SidebarFooterProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (isCollapsed) {
    return (
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
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    );
  }
  
  return (
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
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SidebarFooter;
