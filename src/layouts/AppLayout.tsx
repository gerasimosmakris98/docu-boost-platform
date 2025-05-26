import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import AppSidebar from '@/components/layout/AppSidebar'; // This will be created next

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {isDesktop ? (
        <div
          id="desktop-sidebar" // Added ID
          aria-hidden={!sidebarOpen} // Added aria-hidden
          className={cn(
            "hidden md:block transition-all duration-200 ease-in-out border-r",
            sidebarOpen ? "w-80" : "w-0" // Adjust width as needed
          )}
        >
          {sidebarOpen && <AppSidebar setSidebarOpen={setSidebarOpen} />}
        </div>
      ) : (
        // Mobile Sidebar (Sheet)
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
              aria-controls="desktop-sidebar" // Added
              aria-expanded={sidebarOpen} // Added
              aria-label="Open navigation menu" // Added
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          {/* Header content can be added here if needed later */}
          <div className="flex-1" />
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
