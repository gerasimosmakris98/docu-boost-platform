
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export interface ProfileHeaderProps {
  profileData: {
    name: string;
    title?: string;
    email?: string;
  };
}

const ProfileHeader = ({ profileData }: ProfileHeaderProps) => {
  const initials = getInitials(profileData.name || 'User');
  
  return (
    <div className="flex items-center space-x-4 mb-8">
      <Avatar className="h-16 w-16 border-2 border-primary">
        <AvatarImage src="/placeholder.svg" alt={profileData.name} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-2xl font-bold">{profileData.name}</h1>
        {profileData.title && <p className="text-gray-400">{profileData.title}</p>}
      </div>
    </div>
  );
};

export default ProfileHeader;
