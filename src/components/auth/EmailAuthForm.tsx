
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth/useAuth";

interface EmailAuthFormProps {
  authType: "signin" | "signup";
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
  onSuccess?: (redirectPath: string) => void;
  onForgotPassword?: () => void;
}

const EmailAuthForm = ({ 
  authType, 
  isLoading, 
  setIsLoading, 
  showPassword = false,
  togglePasswordVisibility,
  onSuccess, 
  onForgotPassword 
}: EmailAuthFormProps) => {
  const { loginWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authType === "signup") {
        // Validate passwords match for signup
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setIsLoading(false);
          return;
        }
        
        // Validate password strength
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters");
          setIsLoading(false);
          return;
        }
        
        // Validate full name is provided
        if (!fullName.trim()) {
          toast.error("Please provide your full name");
          setIsLoading(false);
          return;
        }
        
        // Handle signup with Supabase
        await signUpWithEmail(email, password, fullName);
        toast.success("Account created! Please check your email to confirm your account.");
      } else {
        // Handle signin with Supabase
        await loginWithEmail(email, password);
        toast.success("Signed in successfully");
        onSuccess?.("/chat");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleEmailAuth} className="space-y-4">
      {authType === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required={authType === "signup"}
            className="bg-gray-900/50 border-gray-700 placeholder:text-gray-500"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-gray-900/50 border-gray-700 placeholder:text-gray-500"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-gray-300">Password</Label>
          {authType === "signin" && onForgotPassword && (
            <Button 
              type="button" 
              variant="link" 
              className="p-0 h-auto text-xs text-primary"
              onClick={(e) => {
                e.preventDefault();
                onForgotPassword();
              }}
            >
              Forgot password?
            </Button>
          )}
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-900/50 border-gray-700 placeholder:text-gray-500 pr-10"
          />
          {togglePasswordVisibility && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>
      
      {authType === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={authType === "signup"}
              className="bg-gray-900/50 border-gray-700 placeholder:text-gray-500 pr-10"
            />
            {togglePasswordVisibility && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
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
};

export default EmailAuthForm;
