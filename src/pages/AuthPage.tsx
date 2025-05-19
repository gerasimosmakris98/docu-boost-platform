
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import AuthContainer from "@/components/auth/AuthContainer";
import AuthTypeToggle from "@/components/auth/AuthTypeToggle";
import EmailAuthForm from "@/components/auth/EmailAuthForm";
import MagicLinkForm from "@/components/auth/MagicLinkForm";
import OAuthButtons from "@/components/auth/OAuthButtons";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

type AuthType = "signin" | "signup";
type ProviderType = "email" | "magic" | "oauth" | "forgot";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loginWithEmail, signUpWithEmail, loginWithProvider } = useAuth();
  
  const [authType, setAuthType] = useState<AuthType>("signin");
  const [providerType, setProviderType] = useState<ProviderType>("email");
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the return URL from location state or default to app home
  const from = location.state?.from?.pathname || "/";
  
  useEffect(() => {
    // If user is already authenticated, redirect to the return URL
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  const handleOAuthSignIn = async (provider: 'google') => {
    setIsLoading(true);
    
    try {
      await loginWithProvider(provider as any);
      // The redirect will happen automatically, no need to navigate
    } catch (error: any) {
      console.error("OAuth error:", error);
      setIsLoading(false);
    }
  };

  const getTitle = () => authType === "signin" ? "Sign In" : "Create Account";
  const getDescription = () => {
    return authType === "signin"
      ? "Enter your credentials to access your account"
      : "Create a new account to get started";
  };
  
  const renderAuthContent = () => (
    <Tabs defaultValue="email" className="w-full" onValueChange={(value) => setProviderType(value as ProviderType)}>
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="email" className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Email</span>
        </TabsTrigger>
        <TabsTrigger value="magic" className="flex items-center gap-1">
          <span className="text-lg">✨</span>
          <span className="hidden sm:inline">Magic Link</span>
        </TabsTrigger>
        <TabsTrigger value="oauth" className="flex items-center gap-1">
          <LogIn className="h-3 w-3" />
          <span className="hidden sm:inline">Google</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="email">
        <EmailAuthForm 
          authType={authType} 
          isLoading={isLoading} 
          setIsLoading={setIsLoading}
          onSuccess={(path) => navigate(path, { replace: true })}
          onForgotPassword={() => setProviderType("forgot")}
        />
      </TabsContent>
      
      <TabsContent value="magic">
        <MagicLinkForm 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </TabsContent>
      
      <TabsContent value="oauth">
        <OAuthButtons 
          isLoading={isLoading}
          onProviderSelect={handleOAuthSignIn}
        />
      </TabsContent>

      <TabsContent value="forgot">
        <ForgotPasswordForm 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onBackToLogin={() => setProviderType("email")}
        />
      </TabsContent>
    </Tabs>
  );
  
  return (
    <AuthContainer
      title={getTitle()}
      description={getDescription()}
      content={renderAuthContent()}
      footer={<AuthTypeToggle authType={authType} onToggle={setAuthType} />}
    />
  );
};

export default AuthPage;
