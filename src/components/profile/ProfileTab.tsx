
import React from "react";
import { User as UserType } from "@/services/authService";
import ProfileHeader from "./ProfileHeader";
import ProfileSummary from "./ProfileSummary";

interface ProfileTabProps {
  profileData: UserType | {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
  resumeData: {
    summary: string;
  };
  onSaveChanges: () => void;
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
