
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LinkedInProfile } from "@/contexts/AuthContext";
import LinkedInImport from "../linkedin/LinkedInImport";
import { toast } from "sonner";
import { EditIcon, Save } from "lucide-react";

interface ProfileData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
}

interface ProfileTabProps {
  profileData: ProfileData;
  resumeData: {
    summary: string;
  };
  onSaveChanges: (updates: any) => void;
}

const ProfileTab = ({ profileData, resumeData, onSaveChanges }: ProfileTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: profileData.title || '',
    phone: profileData.phone || '',
    location: profileData.location || '',
    website: profileData.website || '',
    summary: resumeData.summary || ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveChanges(formData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setFormData({
      title: profileData.title || '',
      phone: profileData.phone || '',
      location: profileData.location || '',
      website: profileData.website || '',
      summary: resumeData.summary || ''
    });
    setIsEditing(false);
  };
  
  const handleLinkedInProfileImported = (profile: LinkedInProfile) => {
    // Update the profile with LinkedIn data
    const updates = {
      title: profile.title,
      summary: profile.summary,
      // You could map more fields here
    };
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    toast.success("LinkedIn profile imported successfully");
    onSaveChanges(updates);
  };
  
  return (
    <div className="space-y-6">
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
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditing ? (
            <div>
              <p className="text-gray-300 whitespace-pre-line">
                {formData.summary || 'No professional summary specified.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea 
                id="summary" 
                name="summary" 
                value={formData.summary} 
                onChange={handleChange} 
                rows={6}
                placeholder="Write a brief professional summary highlighting your expertise and career objectives..."
                className="resize-none bg-gray-800/50 border-gray-700"
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Import Profile Data</CardTitle>
        </CardHeader>
        <CardContent>
          <LinkedInImport onProfileImported={handleLinkedInProfileImported} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
