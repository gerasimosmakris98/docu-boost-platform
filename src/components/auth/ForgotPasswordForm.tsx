
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ForgotPasswordFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordForm = ({ isLoading, setIsLoading, onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast.success("Password reset link sent! Check your email");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-md mb-4">
          <p>We've sent a password reset link to <strong>{email}</strong></p>
          <p className="text-sm mt-2">Please check your email inbox and spam folder</p>
        </div>
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={onBackToLogin}
        >
          Return to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleForgotPassword} className="space-y-4">
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
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          "Send Password Reset Link"
        )}
      </Button>

      <Button 
        type="button" 
        variant="ghost" 
        className="w-full flex items-center justify-center"
        onClick={onBackToLogin}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to login
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
