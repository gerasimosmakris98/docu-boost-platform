
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SettingsTabProps {
  profileData: {
    name: string;
    email: string;
  };
  onSaveChanges: (updates: any) => void;
}

const SettingsTab = ({ profileData, onSaveChanges }: SettingsTabProps) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saveReminders, setSaveReminders] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  
  const handleSavePreferences = () => {
    try {
      // Save preference changes
      onSaveChanges({
        preferences: {
          emailNotifications,
          weeklyDigest,
          saveReminders,
          darkMode
        }
      });
      toast.success("Preferences updated successfully");
    } catch (error) {
      toast.error("Failed to update preferences");
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-gray-200">{profileData.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-gray-200">{profileData.email}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive important updates via email</p>
            </div>
            <Switch 
              id="emailNotifications" 
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyDigest">Weekly Digest</Label>
              <p className="text-sm text-gray-500">Get a weekly summary of your activities</p>
            </div>
            <Switch 
              id="weeklyDigest" 
              checked={weeklyDigest} 
              onCheckedChange={setWeeklyDigest} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="saveReminders">Save Reminders</Label>
              <p className="text-sm text-gray-500">Get reminded to save your progress</p>
            </div>
            <Switch 
              id="saveReminders" 
              checked={saveReminders} 
              onCheckedChange={setSaveReminders} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-gray-500">Use dark theme for the application</p>
            </div>
            <Switch 
              id="darkMode" 
              checked={darkMode} 
              onCheckedChange={setDarkMode} 
            />
          </div>
          
          <div className="pt-4">
            <Button onClick={handleSavePreferences}>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
