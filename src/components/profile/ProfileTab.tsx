
import React from "react";
import ProfileHeader from "./ProfileHeader";
import ProfileSummary from "./ProfileSummary";

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
  return (
    <div className="space-y-6">
      <ProfileHeader profileData={profileData} />
      <ProfileSummary summary={resumeData.summary} onSave={onSaveChanges} />
    </div>
  );
};

export default ProfileTab;
