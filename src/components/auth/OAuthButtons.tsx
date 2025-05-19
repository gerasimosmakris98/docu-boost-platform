
import { Button } from "@/components/ui/button";
import { Github, Linkedin, LogIn } from "lucide-react";

interface OAuthButtonsProps {
  isLoading: boolean;
  onProviderSelect: (provider: 'google' | 'github' | 'linkedin') => void;
}

const OAuthButtons = ({ isLoading, onProviderSelect }: OAuthButtonsProps) => {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => onProviderSelect('google')}
        disabled={isLoading}
      >
        <LogIn className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => onProviderSelect('github')}
        disabled={isLoading}
      >
        <Github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => onProviderSelect('linkedin')}
        disabled={isLoading}
      >
        <Linkedin className="mr-2 h-4 w-4" />
        Continue with LinkedIn
      </Button>
    </div>
  );
};

export default OAuthButtons;
