
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import PersonalInfoCard from '@/components/profile/PersonalInfoCard';
import ProfessionalSummaryCard from '@/components/profile/ProfessionalSummaryCard';
import SocialLinksSection from '@/components/profile/SocialLinksSection';
import { toast } from '@/components/ui/use-toast';

const ProfileTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <PersonalInfoCard onSave={handleSave} isLoading={isLoading} />
      </Card>
      
      <Card className="bg-gray-900 border-gray-800">
        <ProfessionalSummaryCard onSave={handleSave} isLoading={isLoading} />
      </Card>
      
      <Card className="bg-gray-900 border-gray-800">
        <SocialLinksSection />
      </Card>
    </div>
  );
};

export default ProfileTab;
