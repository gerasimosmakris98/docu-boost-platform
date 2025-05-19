
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LinkedInProfile } from "@/contexts/AuthContext";
import { toast } from "sonner";
import LinkedInImport from "../linkedin/LinkedInImport";
import SocialLinksSection from "./SocialLinksSection";
import PersonalInfoCard from "./PersonalInfoCard";
import ProfessionalSummaryCard from "./ProfessionalSummaryCard";

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
  const { isAuthenticated, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: profileData.title || '',
    phone: profileData.phone || '',
    location: profileData.location || '',
    website: profileData.website || '',
    summary: resumeData.summary || ''
  });
  
  // Refresh data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    }
  }, [isAuthenticated, refreshProfile]);
  
  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        title: profile.title || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        summary: profile.summary || ''
      });
    }
  }, [profile, profileData, resumeData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveChanges = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
    onSaveChanges(updates);
  };
  
  const handleLinkedInProfileImported = (linkedInProfile: LinkedInProfile) => {
    // Update form data with LinkedIn data
    setFormData(prev => ({
      ...prev,
      title: linkedInProfile.title || prev.title,
      summary: linkedInProfile.summary || prev.summary
    }));
    
    // Refresh profile data
    refreshProfile();
    
    toast.success("LinkedIn profile imported successfully");
  };
  
  return (
    <div className="space-y-6">
      <PersonalInfoCard 
        profileData={profileData}
        onSaveChanges={handleSaveChanges}
      />
      
      <ProfessionalSummaryCard 
        summary={formData.summary} 
        isEditing={isEditing}
        onChange={handleChange}
      />
      
      <SocialLinksSection />
      
      <LinkedInImport onProfileImported={handleLinkedInProfileImported} />
    </div>
  );
};

export default ProfileTab;
