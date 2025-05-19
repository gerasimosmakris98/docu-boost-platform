import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGoogle, FaGithub, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type AuthType = "signin" | "signup";
type ProviderType = "email" | "magic" | "oauth";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signInWithEmail, signUpWithEmail, signInWithOAuth, signInWithMagicLink } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authType, setAuthType] = useState<AuthType>("signin");
  const [providerType, setProviderType] = useState<ProviderType>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  
  // Get the return URL from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";
  
  useEffect(() => {
    // If user is already authenticated, redirect to the return URL
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authType === "signup") {
        // Validate passwords match for signup
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        
        // Validate password strength
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters");
          return;
        }
        
        await signUpWithEmail(email, password);
        toast.success("Account created! Please check your email to confirm your account.");
      } else {
        // Sign in with email/password
        const result = await signInWithEmail(email, password);
        if (result.success) {
          toast.success("Signed in successfully");
          navigate(from, { replace: true });
        } else {
          toast.error(result.error || "Failed to sign in");
        }
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMagicLinkAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
      toast.success("Magic link sent! Check your email to sign in.");
    } catch (error: any) {
      console.error("Magic link error:", error);
      toast.error(error.message || "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'linkedin') => {
    setIsLoading(true);
    
    try {
      await signInWithOAuth(provider);
      // The redirect will happen automatically, no need to navigate
    } catch (error: any) {
      console.error("OAuth error:", error);
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };
  
  const renderEmailForm = () => (
    <form onSubmit={handleEmailAuth} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      {authType === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      )}
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {authType === "signin" ? "Signing in..." : "Signing up..."}
          </>
        ) : (
          authType === "signin" ? "Sign In" : "Sign Up"
        )}
      </Button>
    </form>
  );
  
  const renderMagicLinkForm = () => (
    <form onSubmit={handleMagicLinkAuth} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="magic-email">Email</Label>
        <Input
          id="magic-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      {magicLinkSent ? (
        <div className="p-4 bg-green-50 text-green-700 rounded-md">
          <p className="text-sm">Magic link sent! Check your email to sign in.</p>
        </div>
      ) : (
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending magic link...
            </>
          ) : (
            "Send Magic Link"
          )}
        </Button>
      )}
    </form>
  );
  
  const renderOAuthButtons = () => (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthSignIn('google')}
        disabled={isLoading}
      >
        <FaGoogle className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthSignIn('github')}
        disabled={isLoading}
      >
        <FaGithub className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthSignIn('linkedin')}
        disabled={isLoading}
      >
        <FaLinkedin className="mr-2 h-4 w-4" />
        Continue with LinkedIn
      </Button>
    </div>
  );
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {authType === "signin" ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center">
              {authType === "signin"
                ? "Enter your credentials to access your account"
                : "Create a new account to get started"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="email" className="w-full" onValueChange={(value) => setProviderType(value as ProviderType)}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="email" className="flex items-center gap-1">
                  <MdEmail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email</span>
                </TabsTrigger>
                <TabsTrigger value="magic" className="flex items-center gap-1">
                  <span className="text-lg">✨</span>
                  <span className="hidden sm:inline">Magic Link</span>
                </TabsTrigger>
                <TabsTrigger value="oauth" className="flex items-center gap-1">
                  <FaGoogle className="h-3 w-3" />
                  <span className="hidden sm:inline">OAuth</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                {renderEmailForm()}
              </TabsContent>
              
              <TabsContent value="magic">
                {renderMagicLinkForm()}
              </TabsContent>
              
              <TabsContent value="oauth">
                {renderOAuthButtons()}
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-2">
              {authType === "signin" ? (
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => setAuthType("signup")}
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline font-medium"
                    onClick={() => setAuthType("signin")}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
