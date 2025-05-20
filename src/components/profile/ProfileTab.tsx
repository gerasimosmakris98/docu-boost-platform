
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import ProfessionalSummaryCard from '@/components/profile/ProfessionalSummaryCard';
import SocialLinksSection from '@/components/profile/SocialLinksSection';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  resumeData: { summary: string };
  onSaveChanges: (updates: any) => void;
}

const ProfileTab = ({ profileData, resumeData, onSaveChanges }: ProfileTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(resumeData?.summary || '');
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated");
      onSaveChanges({ summary });
    } catch (error) {
      toast.error("Could not update profile. Please try again.");
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value);
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <PersonalInfoCard 
          profileData={profileData} 
          isLoading={isLoading}
          onSaveChanges={onSaveChanges}
        />
      </Card>
      
      <Card className="bg-gray-900 border-gray-800">
        <ProfessionalSummaryCard 
          summary={summary} 
          isEditing={isEditing}
          isLoading={isLoading}
          onChange={handleSummaryChange}
          setIsEditing={setIsEditing}
          onSave={handleSave}
        />
      </Card>
      
      <Card className="bg-gray-900 border-gray-800">
        <SocialLinksSection />
      </Card>
    </div>
  );
};

export default ProfileTab;
