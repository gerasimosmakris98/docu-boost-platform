
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

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBackToChat = () => {
    navigate('/chat');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          {user && <ProfileHeader user={user} />}
          
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToChat}
                  className="ml-2"
                  title="Back to Chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <TabsContent value="profile">
                <ProfileTab />
              </TabsContent>
              
              <TabsContent value="settings">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
