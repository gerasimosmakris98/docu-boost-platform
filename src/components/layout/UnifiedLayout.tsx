
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
      <GradientBackground variant="primary" className="min-h-screen">
        <div className="flex-1">
          {children}
        </div>
        {showFooter && <Footer />}
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="primary" className="h-screen">
      <div className="flex h-full text-white overflow-hidden">
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
    </GradientBackground>
  );
};

export default UnifiedLayout;
