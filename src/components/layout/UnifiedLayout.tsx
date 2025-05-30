
import { useAuth } from "@/contexts/auth/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import UnifiedSidebar from "./UnifiedSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Footer from "./Footer";
import GradientBackground from "@/components/ui/GradientBackground";

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
      <div className="flex h-screen text-white">
        {/* Mobile menu button */}
        {isMobile && sidebarCollapsed && (
          <div className="absolute top-4 left-4 z-50">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="text-white bg-black/20 backdrop-blur-sm border border-white/10 hover:bg-white/10"
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
        
        {/* Main content */}
        <div className={cn(
          "flex-1 flex flex-col min-h-0",
          !sidebarCollapsed && isMobile ? "hidden" : "flex"
        )}>
          {children}
          {showFooter && <Footer />}
        </div>
      </div>
    </div>
  );
};

export default UnifiedLayout;
