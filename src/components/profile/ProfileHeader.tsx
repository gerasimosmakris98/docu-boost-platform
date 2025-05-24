
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import Logo from "@/components/ui/Logo";

export interface ProfileHeaderProps {
  profileData: {
    name: string;
    title?: string;
    email?: string;
    avatarUrl?: string;
  };
}

const ProfileHeader = ({ profileData }: ProfileHeaderProps) => {
  const initials = getInitials(profileData.name || 'User');
  
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8">
      <Avatar className="h-20 w-20 border-2 border-primary">
        <AvatarImage src={profileData.avatarUrl || "/placeholder.svg"} alt={profileData.name} />
        <AvatarFallback className="text-lg bg-primary/10">{initials}</AvatarFallback>
      </Avatar>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold">{profileData.name}</h1>
        {profileData.title && <p className="text-gray-400">{profileData.title}</p>}
        {profileData.email && <p className="text-sm text-gray-500">{profileData.email}</p>}
      </div>
      <div className="hidden sm:block ml-auto">
        <Logo size="md" withLink={false} />
      </div>
    </div>
  );
};

export default ProfileHeader;
