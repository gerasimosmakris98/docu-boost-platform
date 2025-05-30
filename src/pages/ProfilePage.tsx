
import { useState } from 'react';
import { motion } from 'framer-motion';
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
import GradientBackground from '@/components/ui/GradientBackground';
import ModernCard from '@/components/ui/ModernCard';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, profile } = useAuth();

  const profileData = {
    name: profile?.full_name || user?.user_metadata?.full_name || 'Echo User',
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
        <GradientBackground className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mb-8"
                >
                  <ModernCard className="p-6" gradient>
                    <ProfileHeader profileData={profileData} />
                  </ModernCard>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ModernCard className="p-6" gradient>
                  <Tabs
                    defaultValue="profile"
                    className="w-full"
                    value={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
                        <TabsTrigger 
                          value="profile"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                        >
                          Personal Info
                        </TabsTrigger>
                        <TabsTrigger 
                          value="settings"
                          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                        >
                          Account Settings
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <TabsContent value="profile">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <ProfileTab 
                          profileData={profileData}
                          resumeData={{ summary: profile?.summary || '' }}
                          onSaveChanges={handleSaveChanges}
                        />
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="settings">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <SettingsTab 
                          profileData={{
                            name: profileData.name,
                            email: profileData.email,
                          }}
                          onSaveChanges={handleSaveChanges}
                        />
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </ModernCard>
              </motion.div>
            </motion.div>
          </div>
        </GradientBackground>
      </UnifiedLayout>
    </ProtectedRoute>
  );
};

export default ProfilePage;
