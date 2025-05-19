
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EditIcon, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
}

interface PersonalInfoCardProps {
  profileData: ProfileData;
  onSaveChanges: (updates: any) => void;
}

const PersonalInfoCard = ({ profileData, onSaveChanges }: PersonalInfoCardProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: profile?.title || profileData.title || '',
    phone: profile?.phone || profileData.phone || '',
    location: profile?.location || profileData.location || '',
    website: profile?.website || profileData.website || '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!user) {
        toast.error("Please sign in to save your changes");
        return;
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          title: formData.title,
          phone: formData.phone,
          location: formData.location,
          website: formData.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await refreshProfile();
      
      // Notify parent component
      onSaveChanges(formData);
      
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    if (profile) {
      setFormData({
        title: profile.title || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
      });
    }
    setIsEditing(false);
  };
  
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
        {!isEditing ? (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-gray-400">Name</p>
              <p className="font-medium">{profileData.name}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-gray-400">Title</p>
              <p className="font-medium">{formData.title || 'No title specified'}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-medium">{profileData.email}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-gray-400">Phone</p>
              <p className="font-medium">{formData.phone || 'No phone specified'}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-gray-400">Location</p>
              <p className="font-medium">{formData.location || 'No location specified'}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm text-gray-400">Website</p>
              <p className="font-medium">
                {formData.website ? (
                  <a 
                    href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {formData.website}
                  </a>
                ) : (
                  'No website specified'
                )}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={profileData.name} 
                  disabled 
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="e.g. Software Engineer"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={profileData.email} 
                  disabled 
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  placeholder="e.g. +1 (555) 123-4567"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder="e.g. New York, NY"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  name="website" 
                  value={formData.website} 
                  onChange={handleChange} 
                  placeholder="e.g. yourwebsite.com"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
