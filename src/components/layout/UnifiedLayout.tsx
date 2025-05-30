
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black">
        <div className="flex-1">
          {children}
        </div>
        {showFooter && <Footer />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black">
      <div className="flex h-screen text-white overflow-hidden">
        {/* Mobile menu button - Improved positioning and visibility */}
        {isMobile && sidebarCollapsed && (
          <div className="absolute top-4 left-4 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="h-11 w-11 text-white border border-white/20 hover:bg-white/10 bg-white/5 backdrop-blur-sm shadow-lg min-h-[44px] min-w-[44px]"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        {/* Unified Sidebar */}
        <UnifiedSidebar 
          activeConversationId={activeConversationId}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        
        {/* Main content - Improved responsive behavior */}
        <div className={cn(
          "flex-1 flex flex-col min-h-0 relative transition-all duration-200",
          !sidebarCollapsed && isMobile ? "hidden" : "flex",
          // Ensure proper sizing on all devices
          "w-full max-w-full overflow-hidden"
        )}>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {children}
          </div>
          {showFooter && <Footer />}
        </div>
      </div>
    </div>
  );
};

export default UnifiedLayout;
