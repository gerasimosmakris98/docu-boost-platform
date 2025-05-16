
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkedInProfile } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { Linkedin, Loader, FileCheck, FileText } from "lucide-react";
import { toast } from "sonner";

interface LinkedInImportProps {
  onProfileImported?: (profile: LinkedInProfile) => void;
}

const LinkedInImport = ({ onProfileImported }: LinkedInImportProps) => {
  const { user, isAuthenticated, importLinkedInProfile, linkedInProfile } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleImport = async () => {
    if (!isAuthenticated || user?.provider !== 'linkedin') {
      toast.error("Please sign in with LinkedIn first");
      return;
    }

    setIsImporting(true);
    try {
      const profile = await importLinkedInProfile();
      setImportSuccess(true);
      
      if (onProfileImported) {
        onProfileImported(profile);
      }
      
      toast.success("LinkedIn profile imported successfully!");
    } catch (error) {
      console.error("Error importing LinkedIn profile:", error);
      toast.error("Failed to import LinkedIn profile");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Linkedin className="h-5 w-5 text-[#0A66C2]" />
          LinkedIn Profile Import
        </CardTitle>
        <CardDescription>
          Import your LinkedIn profile data to automatically populate your resume and cover letters
        </CardDescription>
      </CardHeader>
      <CardContent>
        {linkedInProfile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <FileCheck className="h-4 w-4" />
              Profile data imported successfully
            </div>
            <div className="text-sm">
              <p className="font-medium">{linkedInProfile.title}</p>
              <p className="text-muted-foreground">{linkedInProfile.company}</p>
              <p className="mt-2">{linkedInProfile.skills.slice(0, 5).join(', ')}{linkedInProfile.skills.length > 5 ? '...' : ''}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              {isAuthenticated && user?.provider === 'linkedin'
                ? "Ready to import your LinkedIn profile"
                : "Sign in with LinkedIn to import your profile data"}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleImport}
          disabled={isImporting || !isAuthenticated || user?.provider !== 'linkedin'}
          className="w-full gap-2"
        >
          {isImporting ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : linkedInProfile ? (
            <>
              <FileCheck className="h-4 w-4" />
              Refresh Profile Data
            </>
          ) : (
            <>
              <Linkedin className="h-4 w-4" />
              Import LinkedIn Profile
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LinkedInImport;
