
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Plus, LogOut, Settings, User, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import ConversationList from '@/components/conversation/ConversationList';
import AdvisorList from '@/components/advisor/AdvisorList';

const MainLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const initials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : 'AI';
  
  const Sidebar = () => (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-xl font-semibold">AI Career Advisor</h1>
        {isDesktop && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 mb-4" 
          onClick={handleNewChat}
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
        
        {/* AI Advisors Section */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">AI ADVISORS</h2>
          <AdvisorList />
        </div>
        
        {/* Conversation History */}
        <div>
          <h2 className="text-sm font-semibold mb-2 text-muted-foreground">RECENT CONVERSATIONS</h2>
          <ConversationList />
        </div>
      </div>
      
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 truncate">
            <p className="text-sm font-medium leading-none">{user?.name || user?.email}</p>
            {user?.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleProfile}>
                  <User className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Profile</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Sign out</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {isDesktop ? (
        <div 
          className={cn(
            "hidden md:block transition-all duration-200 ease-in-out border-r",
            sidebarOpen ? "w-80" : "w-0"
          )}
        >
          {sidebarOpen && <Sidebar />}
        </div>
      ) : (
        // Mobile Sidebar (Sheet)
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute left-4 top-3 z-50 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b flex items-center px-4">
          {!sidebarOpen && isDesktop && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1" />
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
