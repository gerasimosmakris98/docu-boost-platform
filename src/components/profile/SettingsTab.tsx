
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface SettingsTabProps {
  profileData: {
    name: string;
    email: string;
  };
  onSaveChanges: (updates?: any) => void;
}

const SettingsTab = ({ profileData, onSaveChanges }: SettingsTabProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, updateProfile } = useAuth();
  const [name, setName] = useState(profileData.name);
  
  const handleUpdateProfile = async () => {
    if (isAuthenticated) {
      await updateProfile({ full_name: name });
      onSaveChanges();
    } else {
      toast.error("Please log in to update your profile");
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      toast.success("You have been logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const handleBackToChat = () => {
    navigate("/chat");
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white md:hidden"
            onClick={handleBackToChat}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              disabled={!isAuthenticated}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={profileData.email} 
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value="************" 
              disabled
            />
            {isAuthenticated && (
              <p className="text-sm text-muted-foreground mt-1">
                Password changes must be done via email reset
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={handleUpdateProfile} 
            disabled={!isAuthenticated}
          >
            Save Changes
          </Button>
          
          {isAuthenticated && (
            <Button 
              variant="destructive" 
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification settings would go here */}
          <p className="text-muted-foreground">Notification settings coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
