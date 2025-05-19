
import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileSummary from "./ProfileSummary";
import LinkedInImport from "../linkedin/LinkedInImport";
import { LinkedInProfile } from "@/contexts/AuthContext";

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
  const handleLinkedInProfileImported = (profile: LinkedInProfile) => {
    // Update the profile with LinkedIn data
    const updates = {
      title: profile.title,
      summary: profile.summary,
      // You could map more fields here
    };
    
    onSaveChanges(updates);
  };
  
  return (
    <div className="space-y-6">
      <ProfileHeader profileData={profileData} />
      <ProfileSummary summary={resumeData.summary} onSave={onSaveChanges} />
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Import Profile Data</h3>
        <LinkedInImport onProfileImported={handleLinkedInProfileImported} />
      </div>
    </div>
  );
};

export default ProfileTab;
