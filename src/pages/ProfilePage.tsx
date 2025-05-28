
import { useState } from 'react';
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
import UnifiedLayout from '@/components/layout/UnifiedLayout';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, profile } = useAuth();

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

  return (
    <ProtectedRoute>
      <UnifiedLayout>
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
      </UnifiedLayout>
    </ProtectedRoute>
  );
};

export default ProfilePage;
