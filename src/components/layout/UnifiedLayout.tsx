
import { useAuth } from "@/contexts/auth/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import UnifiedSidebar from "./UnifiedSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Footer from "./Footer";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  activeConversationId?: string;
  showFooter?: boolean;
}

const UnifiedLayout = ({ children, activeConversationId, showFooter = false }: UnifiedLayoutProps) => {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  useEffect(() => {
    setSidebarCollapsed(isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        {showFooter && <Footer />}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Mobile menu button */}
      {isMobile && sidebarCollapsed && (
        <div className="absolute top-0 left-0 z-10 p-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-white"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      )}
      
      {/* Unified Sidebar */}
      <UnifiedSidebar 
        activeConversationId={activeConversationId}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      
      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden",
        isMobile && sidebarCollapsed && "pl-12 md:pl-0"
      )}>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        {showFooter && <Footer />}
      </div>
    </div>
  );
};

export default UnifiedLayout;
