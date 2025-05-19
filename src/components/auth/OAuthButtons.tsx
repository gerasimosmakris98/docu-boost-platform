
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthProviderType } from "@/contexts/auth/types";

interface OAuthButtonsProps {
  isLoading: boolean;
  onProviderSelect: (provider: AuthProviderType) => void;
}

const OAuthButtons = ({ isLoading, onProviderSelect }: OAuthButtonsProps) => {
  const { loginWithProvider } = useAuth();

  const handleProviderLogin = async (provider: AuthProviderType) => {
    try {
      onProviderSelect(provider);
      await loginWithProvider(provider);
    } catch (error) {
      console.error(`Error logging in with ${provider}:`, error);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
        onClick={() => handleProviderLogin('google')}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
        onClick={() => handleProviderLogin('linkedin_oidc')}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        )}
        Continue with LinkedIn
      </Button>
      
      <Button
        variant="outline"
        className="w-full bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800 hover:text-white"
        onClick={() => handleProviderLogin('twitter')}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.3174 10.7749L19.1457 4H17.7646L12.7039 9.88256L8.66193 4H4L10.1122 13.0774L4 20.1176H5.38114L10.7247 13.9698L14.994 20.1176H19.6559L13.3171 10.7749H13.3174ZM11.3958 13.1676L10.8023 12.2795L5.9391 5.16544H7.91054L11.7704 10.9303L12.3639 11.8184L17.4616 19.2822H15.4902L11.3958 13.168V13.1676Z" />
          </svg>
        )}
        Continue with X
      </Button>
    </div>
  );
};

export default OAuthButtons;
