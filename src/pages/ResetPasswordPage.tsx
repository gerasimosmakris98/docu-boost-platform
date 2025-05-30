
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth/useAuth";
import GradientBackground from "@/components/ui/GradientBackground";
import ModernCard from "@/components/ui/ModernCard";
import Logo from "@/components/ui/Logo";

const ResetPasswordPage = () => {
  const [isValidResetLink, setIsValidResetLink] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  
  useEffect(() => {
    const checkResetSession = async () => {
      // Check for a 'type=recovery' query parameter in the URL
      const url = new URL(window.location.href);
      const type = url.searchParams.get('type');
      
      if (type === 'recovery') {
        setIsValidResetLink(true);
      } else {
        // Also check if user session exists to handle direct navigations
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setIsValidResetLink(true);
        } else {
          setIsValidResetLink(false);
          setTimeout(() => {
            navigate("/auth", { replace: true });
          }, 1500);
        }
      }
      
      setIsChecking(false);
    };
    
    checkResetSession();
  }, [navigate]);

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, label: "Too short" };
    if (password.length < 8) return { strength: 1, label: "Weak" };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 2, label: "Fair" };
    return { strength: 3, label: "Strong" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.error("Password must contain uppercase, lowercase, and number");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updatePassword(newPassword);
      toast.success("Password updated successfully!");
      navigate("/chat", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  
  if (isChecking) {
    return (
      <GradientBackground className="min-h-screen flex items-center justify-center">
        <ModernCard className="p-8 text-center" gradient>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-white mb-2">Verifying Reset Link</h2>
          <p className="text-white/70">Please wait while we verify your password reset link...</p>
        </ModernCard>
      </GradientBackground>
    );
  }
  
  if (!isValidResetLink) {
    return (
      <GradientBackground className="min-h-screen flex items-center justify-center">
        <ModernCard className="p-8 text-center max-w-md" gradient>
          <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h2>
          <p className="text-white/70 mb-4">
            This password reset link is invalid or has expired. Redirecting you to the login page...
          </p>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            Go to Login
          </Button>
        </ModernCard>
      </GradientBackground>
    );
  }
  
  return (
    <GradientBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Logo size="md" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <ModernCard className="p-8" gradient>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
              <p className="text-white/70">Enter your new password below</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white/90">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm pr-10"
                    disabled={isSubmitting}
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
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.strength
                              ? passwordStrength.strength === 0
                                ? "bg-red-500"
                                : passwordStrength.strength === 1
                                ? "bg-orange-500"
                                : passwordStrength.strength === 2
                                ? "bg-yellow-500"
                                : "bg-green-500"
                              : "bg-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-white/60">
                      Password strength: {passwordStrength.label}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                  disabled={isSubmitting}
                />
                {confirmPassword && newPassword === confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400 text-sm flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Passwords match
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </ModernCard>
        </motion.div>
      </div>
    </GradientBackground>
  );
};

export default ResetPasswordPage;
