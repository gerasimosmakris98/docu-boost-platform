
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EmailAuthFormProps {
  authType: "signin" | "signup";
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSuccess?: (redirectPath: string) => void;
}

const EmailAuthForm = ({ authType, isLoading, setIsLoading, onSuccess }: EmailAuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
        
        // Handle signup logic - would typically call a context method
        toast.success("Account created! Please check your email to confirm your account.");
      } else {
        // Handle signin logic - would typically call a context method
        toast.success("Signed in successfully");
        onSuccess?.("/dashboard");
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
};

export default EmailAuthForm;
