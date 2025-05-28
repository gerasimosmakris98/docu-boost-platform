
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTab from '@/components/profile/ProfileTab';
import SettingsTab from '@/components/profile/SettingsTab';
import { useAuth } from '@/contexts/auth/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UnifiedSidebar from '@/components/layout/UnifiedSidebar';
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  const profileData = {
    name: profile?.full_name || user?.user_metadata?.full_name || 'Anonymous User',
    title: profile?.title || 'Professional',
    email: user?.email || 'email@example.com',
    phone: profile?.phone || '',
    location: profile?.location || '',
    website: profile?.website || '',
  };

  const handleSaveChanges = async (updates: any) => {
    console.log('Saving changes:', updates);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <ProtectedRoute>
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
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        
        {/* Main Content */}
        <div className={cn(
          "flex-1 overflow-auto",
          isMobile && sidebarCollapsed && "pl-12 md:pl-0"
        )}>
          <div className="container mx-auto px-4 py-8">
            {user && <ProfileHeader profileData={profileData} />}
            
            <div className="flex justify-between items-center mb-4">
              <Tabs
                defaultValue="profile"
                className="w-full"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <div className="flex justify-between items-center mb-4">
                  <TabsList className="bg-gray-800">
                    <TabsTrigger value="profile">Personal Info</TabsTrigger>
                    <TabsTrigger value="settings">Account Settings</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="profile">
                  <ProfileTab 
                    profileData={profileData}
                    resumeData={{ summary: profile?.summary || '' }}
                    onSaveChanges={handleSaveChanges}
                  />
                </TabsContent>
                
                <TabsContent value="settings">
                  <SettingsTab 
                    profileData={{
                      name: profileData.name,
                      email: profileData.email,
                    }}
                    onSaveChanges={handleSaveChanges}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
