
import { Button } from "@/components/ui/button";
import { Menu, PlusCircle, Briefcase } from "lucide-react";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat: () => void;
}

const SidebarHeader = ({ isCollapsed, onToggleCollapse, onNewChat }: SidebarHeaderProps) => {
  if (isCollapsed) {
    return (
      <div className="p-2 flex flex-col items-center">
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
          onClick={onNewChat}
        >
          <PlusCircle className="h-5 w-5 text-green-500" />
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-transparent bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text" />
          <span className="font-semibold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            AI Career Advisor
          </span>
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
          onClick={onNewChat}
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
