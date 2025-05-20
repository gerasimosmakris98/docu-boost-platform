
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ProfileTab from "@/components/profile/ProfileTab";
import SettingsTab from "@/components/profile/SettingsTab";
import { UserCircle, Settings, LogOut, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import logo from "@/assets/logo.svg";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, refreshProfile, updateProfile, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState("profile");
  
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    } else {
      // Redirect to auth page if not authenticated
      navigate("/auth", { state: { from: "/profile" } });
    }
  }, [isAuthenticated, refreshProfile, navigate]);
  
  // Use real user data if logged in, otherwise use placeholder data
  const profileData = isAuthenticated && profile ? {
    name: profile.full_name || user?.user_metadata?.full_name || 'Anonymous User',
    title: profile.title || 'Professional',
    email: user?.email || 'email@example.com',
    phone: profile.phone || '',
    location: profile.location || '',
    website: profile.website || '',
  } : {
    name: 'Guest User',
    title: 'Visitor',
    email: 'guest@example.com',
    phone: '',
    location: '',
    website: '',
  };
  
  const handleSaveChanges = async (updates: any) => {
    if (isAuthenticated) {
      try {
        await updateProfile(updates);
        toast.success("Profile updated successfully");
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error("Failed to update profile");
      }
    } else {
      toast.error("Please log in to save your changes");
      navigate("/auth", { state: { from: "/profile" } });
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
    }
  };
  
  const handleBackToChat = () => {
    navigate("/chat");
  };

  // If not authenticated, don't render the profile page at all
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 p-4 hidden md:block">
        <div className="flex flex-col h-full">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <img src={logo} alt="AI Career Advisor" className="h-8 mr-2" />
            </div>
            <h2 className="text-xl font-bold">Your Profile</h2>
            <p className="text-sm text-gray-400">Manage your account</p>
          </div>
          
          <nav className="space-y-1 flex-1">
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${currentTab === 'profile' ? 'bg-gray-800' : ''}`}
              onClick={() => setCurrentTab('profile')}
            >
              <UserCircle className="mr-2 h-4 w-4" /> Personal Info
            </Button>
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${currentTab === 'settings' ? 'bg-gray-800' : ''}`}
              onClick={() => setCurrentTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" /> Account Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white mt-6"
              onClick={handleBackToChat}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Chat
            </Button>
          </nav>
          
          <div className="mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header with back button for mobile */}
            <div className="flex items-center justify-between md:hidden mb-6">
              <img src={logo} alt="AI Career Advisor" className="h-8" />
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={handleBackToChat}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Profile Header */}
            <ProfileHeader profileData={profileData} />
            
            {/* Mobile Tabs */}
            <div className="md:hidden">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Profile Content */}
            {currentTab === "profile" && (
              <ProfileTab 
                profileData={profileData}
                resumeData={{ summary: profile?.summary || '' }}
                onSaveChanges={handleSaveChanges}
              />
            )}
            
            {/* Settings Content */}
            {currentTab === "settings" && (
              <SettingsTab 
                profileData={{
                  name: profile?.full_name || user?.user_metadata?.full_name || 'Anonymous User',
                  email: user?.email || 'email@example.com'
                }}
                onSaveChanges={handleSaveChanges}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
