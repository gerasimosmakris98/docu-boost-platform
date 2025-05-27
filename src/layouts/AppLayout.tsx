
import { useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/layout/AppSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {isDesktop ? (
        <div
          id="desktop-sidebar"
          aria-hidden={!sidebarOpen}
          className={cn(
            "hidden md:block transition-all duration-200 ease-in-out border-r",
            sidebarOpen ? "w-80" : "w-0"
          )}
        >
          {sidebarOpen && <AppSidebar setSidebarOpen={setSidebarOpen} />}
        </div>
      ) : (
        <Sheet open={sidebarOpen && !isDesktop} onOpenChange={(open) => { if (!open) setSidebarOpen(false)}}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute left-4 top-3 z-50 md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <AppSidebar setSidebarOpen={setSidebarOpen} />
          </SheetContent>
        </Sheet>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b flex items-center px-4">
          {isDesktop && !sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-controls="desktop-sidebar"
              aria-expanded={sidebarOpen}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1" />
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
