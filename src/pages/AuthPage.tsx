
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, LogIn } from "lucide-react";
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
  const { isAuthenticated } = useAuth();
  
  const [authType, setAuthType] = useState<AuthType>("signin");
  const [providerType, setProviderType] = useState<ProviderType>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Get the return URL from location state or default to app home
  const from = location.state?.from?.pathname || "/";
  
  useEffect(() => {
    // If user is already authenticated, redirect to the return URL
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const getTitle = () => authType === "signin" ? "Sign In" : "Create Account";
  const getDescription = () => {
    return authType === "signin"
      ? "Enter your credentials to access your account"
      : "Create a new account to get started";
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const renderAuthContent = () => (
    <Tabs defaultValue="email" className="w-full" onValueChange={(value) => setProviderType(value as ProviderType)}>
      <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-900/50">
        <TabsTrigger value="email" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <span>Email</span>
        </TabsTrigger>
        <TabsTrigger value="magic" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <span>Magic Link</span>
        </TabsTrigger>
        <TabsTrigger value="oauth" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
          <span>Google</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="email">
        <EmailAuthForm 
          authType={authType} 
          isLoading={isLoading} 
          setIsLoading={setIsLoading}
          showPassword={showPassword}
          togglePasswordVisibility={togglePasswordVisibility}
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
          onProviderSelect={(provider) => {
            setIsLoading(true);
            // This will be handled by the OAuth flow
          }}
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
