
import React from "react";
import { User, MapPin, Mail, Phone, Globe, Link } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileHeaderProps {
  profileData: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    website: string;
  };
}

const ProfileHeader = ({ profileData }: ProfileHeaderProps) => {
  const { isAuthenticated, user, profile } = useAuth();
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-primary/10 text-primary rounded-full w-20 h-20 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profileData.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profileData.name || "Your Name"}</h2>
            <p className="text-lg text-muted-foreground">{profileData.title || "Your Title"}</p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{profileData.location || "Your Location"}</span>
            </div>
          </div>
          <Button className="mt-2 md:mt-0">Edit Profile</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profileData.email || "email@example.com"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{profileData.phone || "Phone number"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{profileData.website || "Website"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <span>{isAuthenticated ? "LinkedIn Profile" : "Connect LinkedIn"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
