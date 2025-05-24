
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
  onNewChat?: () => void | Promise<void>;
}

const SidebarHeader = ({ isCollapsed, onToggleCollapse, isMobile, onNewChat }: SidebarHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Logo size="md" withLink={false} />
          </motion.div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-white ml-auto"
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
