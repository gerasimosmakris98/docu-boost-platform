
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthForm from "@/components/auth/AuthForm";

const AuthPage = () => {
  const [authType, setAuthType] = useState<"signin" | "signup" | "magic">("signin");
  const navigate = useNavigate();
  
  const handleGuestAccess = () => {
    // For guest access, we don't need authentication
    navigate("/chat");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md space-y-8 p-6 bg-white shadow-md rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to Career Compass
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start managing your career effortlessly.
          </p>
        </div>
        
        <div className="w-full space-y-6">
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
              <AuthForm authType="signin" />
              
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setAuthType("magic")}
                >
                  Sign in with magic link instead
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <AuthForm authType="signup" />
            </TabsContent>
            
            <TabsContent value="magic">
              <div className="mb-4">
                <h3 className="text-lg font-medium">Magic Link Sign In</h3>
                <p className="text-sm text-gray-500">
                  We'll email you a magic link for a password-free sign in.
                </p>
              </div>
              <AuthForm authType="magic" />
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setAuthType("signin")}
                >
                  Back to password sign in
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGuestAccess}
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
