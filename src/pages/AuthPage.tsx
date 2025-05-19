import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Bot, 
  Mail, 
  Lock, 
  User,
  LogIn, 
  UserPlus,
  Loader2,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AuthPage = () => {
  const navigate = useNavigate();
  const { loginWithProvider, loginWithEmail, signUpWithEmail } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [authType, setAuthType] = useState<"signin" | "signup" | "magic">("signin");
  const [error, setError] = useState<string | null>(null);
  
  const handleProviderLogin = async (provider: "google") => {
    setLoading(true);
    setError(null);
    try {
      await loginWithProvider(provider);
      navigate("/chat");
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Failed to log in with Google. Please try again.");
      toast.error("Failed to log in with Google");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (authType === "signin") {
        await loginWithEmail(email, password);
        navigate("/chat");
      } else if (authType === "signup") {
        await signUpWithEmail(email, password, name);
        navigate("/chat");
      } else if (authType === "magic") {
        // Pass empty string as password for magic link login
        await loginWithEmail(email, "");
        toast.success(`Magic link sent to ${email}. Please check your inbox.`);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      setError(error?.message || "Authentication failed. Please try again.");
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-500/10 p-3 border border-green-500/20">
              <Bot className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            AI Career Advisor
          </h1>
          <p className="text-gray-400">
            Your personal AI assistant for career guidance
          </p>
        </div>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to continue to AI Career Advisor
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Button 
              className="w-full mb-4 bg-white text-black hover:bg-gray-100 flex items-center justify-center gap-2"
              onClick={() => handleProviderLogin("google")}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                  Continue with Google
                </>
              )}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>
            
            <Tabs 
              defaultValue="signin" 
              value={authType}
              onValueChange={(value) => setAuthType(value as "signin" | "signup" | "magic")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="magic">Magic Link</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {authType === "signup" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <label className="text-sm" htmlFor="name">Name</label>
                      </div>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={authType === "signup"}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <label className="text-sm" htmlFor="email">Email</label>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-gray-800 border-gray-700"
                    />
                  </div>
                  
                  {authType !== "magic" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-gray-400" />
                        <label className="text-sm" htmlFor="password">Password</label>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={authType !== "magic"}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-900/30 text-red-300 p-3 rounded border border-red-800/30 text-sm flex gap-2 items-start">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : authType === "signin" ? (
                    <LogIn className="h-4 w-4 mr-2" />
                  ) : authType === "signup" ? (
                    <UserPlus className="h-4 w-4 mr-2" />
                  ) : (
                    <Mail className="h-4 w-4 mr-2" />
                  )}
                  
                  {authType === "signin" ? "Sign In" : 
                   authType === "signup" ? "Sign Up" : 
                   "Send Magic Link"}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          
          <CardFooter className="border-t border-gray-800 mt-4 pt-4 flex justify-between items-center">
            <p className="text-sm text-gray-400">
              Already have an account?
            </p>
            <Link to="/chat" className="text-sm text-green-500 hover:text-green-400 flex items-center">
              Continue as guest
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
