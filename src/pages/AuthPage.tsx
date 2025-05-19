import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner";
import { cleanupAuthState } from "@/services/authService";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, signInWithMagicLink } = useAuth();
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [authType, setAuthType] = useState<"signin" | "signup" | "magic">("signin");
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean up auth state before signin
    cleanupAuthState();
    
    try {
      await signIn(email, password);
      // The signIn function now handles navigation
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean up auth state before signup
    cleanupAuthState();
    
    try {
      await signUp(email, password, fullName);
      // The signUp function now handles navigation
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to sign up");
      setIsSubmitting(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean up auth state before magic link
    cleanupAuthState();
    
    try {
      await signInWithMagicLink(email);
      // Use sonner toast instead of shadcn/ui toast to match the rest of the file
      toast.success("Check your email! We've sent you a magic link to sign in.");
      setIsSubmitting(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send magic link");
      setIsSubmitting(false);
    }
  };
  
  const handleGuestAccess = () => {
    // For guest access, we don't need authentication
    navigate("/chat");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to Career Compass
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start managing your career effortlessly.
          </p>
        </div>
        
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Tabs 
              defaultValue="signin" 
              value={authType}
              onValueChange={(value) => setAuthType(value as "signin" | "signup" | "magic")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Signing Up..." : "Sign Up"}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="link" onClick={handleGuestAccess}>
              Continue as Guest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
