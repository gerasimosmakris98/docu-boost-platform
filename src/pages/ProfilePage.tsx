
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
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.svg';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Create a profile data object for the components
  const profileData = {
    name: profile?.full_name || user?.user_metadata?.full_name || 'Anonymous User',
    title: profile?.title || 'Professional',
    email: user?.email || 'email@example.com',
    phone: profile?.phone || '',
    location: profile?.location || '',
    website: profile?.website || '',
  };

  const handleBackToChat = () => {
    navigate('/chat');
  };

  const handleSaveChanges = async (updates: any) => {
    // Handle saving profile changes
    console.log('Saving changes:', updates);
    // Add actual implementation here
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <img src={logo} alt="AI Career Advisor" className="h-10" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToChat}
              className="text-gray-400 hover:text-white"
              title="Back to Chat"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
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
    </ProtectedRoute>
  );
};

export default ProfilePage;
