
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EditIcon, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  isLoading?: boolean;
  onSaveChanges: (updates: any) => void;
}

const PersonalInfoCard = ({ 
  profileData,
  isLoading = false,
  onSaveChanges 
}: PersonalInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profileData.name || '',
    title: profileData.title || '',
    email: profileData.email || '',
    phone: profileData.phone || '',
    location: profileData.location || '',
    website: profileData.website || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Save changes to profile
      onSaveChanges(formData);
      toast.success("Personal information updated");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update personal information");
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-gray-200">{profileData.name || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Job Title</p>
              <p className="text-gray-200">{profileData.title || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-200">{profileData.email || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-200">{profileData.phone || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-gray-200">{profileData.location || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <p className="text-gray-200">{profileData.website || 'Not specified'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-800/50 border-gray-700"
                  readOnly={formData.email === profileData.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
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
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
