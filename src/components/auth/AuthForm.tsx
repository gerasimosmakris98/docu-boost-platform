
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cleanupAuthState } from "@/services/authService";

interface AuthFormProps {
  authType: "signin" | "signup" | "magic";
}

const AuthForm = ({ authType }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, signInWithMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clean up auth state before any auth action
    cleanupAuthState();
    
    try {
      if (authType === "signin") {
        await signIn(email, password);
      } else if (authType === "signup") {
        await signUp(email, password, { full_name: fullName });
      } else if (authType === "magic") {
        await signInWithMagicLink(email);
      }
    } catch (error: any) {
      // Error handling is done in the auth functions
      // This catch just prevents the unhandled promise rejection
    } finally {
      // Only set submitting to false if we're still in the magic link flow
      // For signin/signup, the page will navigate away
      if (authType === "magic") {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {authType === "signup" && (
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
        )}
        
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
        
        {authType !== "magic" && (
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={authType === "signin" ? "current-password" : "new-password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? authType === "signin" 
              ? "Signing In..." 
              : authType === "signup" 
                ? "Signing Up..." 
                : "Sending Link..."
            : authType === "signin" 
              ? "Sign In" 
              : authType === "signup" 
                ? "Sign Up" 
                : "Send Magic Link"
          }
        </Button>
      </div>
    </form>
  );
};

export default AuthForm;
