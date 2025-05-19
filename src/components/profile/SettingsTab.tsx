
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SettingsTabProps {
  profileData: {
    name: string;
    email: string;
  };
  onSaveChanges: (updates?: any) => void;
}

const SettingsTab = ({ profileData, onSaveChanges }: SettingsTabProps) => {
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
      toast.success("You have been logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
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
