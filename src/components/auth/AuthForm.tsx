
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth/useAuth";
import { motion } from "framer-motion";

const AuthForm = () => {
  const { loginWithEmail, signUpWithEmail, loginWithProvider } = useAuth();
  const [authType, setAuthType] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authType === "signup") {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }
        
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters");
          setIsLoading(false);
          return;
        }
        
        if (!fullName.trim()) {
          toast.error("Please provide your full name");
          setIsLoading(false);
          return;
        }
        
        await signUpWithEmail(email, password, fullName);
        toast.success("Account created! Please check your email to confirm your account.");
      } else {
        await loginWithEmail(email, password);
        toast.success("Signed in successfully");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await loginWithProvider('google');
    } catch (error: any) {
      console.error("Google auth error:", error);
      toast.error(error.message || "Google authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auth Type Toggle */}
      <div className="flex bg-white/10 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setAuthType("signin")}
          className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-all ${
            authType === "signin"
              ? "bg-white text-gray-900"
              : "text-white/70 hover:text-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setAuthType("signup")}
          className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-all ${
            authType === "signup"
              ? "bg-white text-gray-900"
              : "text-white/70 hover:text-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {authType === "signup" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="fullName" className="text-white/90">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={authType === "signup"}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </motion.div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {authType === "signup" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={authType === "signup"}
                className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </motion.div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white" 
          disabled={isLoading}
        >
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-2 text-white/60">Or continue with</span>
        </div>
      </div>

      {/* Google Auth */}
      <Button
        onClick={handleGoogleAuth}
        variant="outline"
        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
        disabled={isLoading}
      >
        <FcGoogle className="mr-2 h-4 w-4" />
        Google
      </Button>
    </div>
  );
};

export default AuthForm;
