
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

const EnhancedAuthForm = () => {
  const [authType, setAuthType] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { 
    loginWithEmail, 
    signUpWithEmail, 
    authError, 
    clearAuthError,
    isLoading 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/chat';

  // Clear errors when switching auth types or changing inputs
  useEffect(() => {
    clearAuthError();
    setValidationErrors({});
  }, [authType, email, password, confirmPassword, fullName]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Email validation
    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (authType === "signup" && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = "Password must contain uppercase, lowercase, and number";
    }
    
    // Signup specific validations
    if (authType === "signup") {
      if (!fullName.trim()) {
        errors.fullName = "Full name is required";
      } else if (fullName.trim().length < 2) {
        errors.fullName = "Full name must be at least 2 characters";
      }
      
      if (!confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (authType === "signup") {
        await signUpWithEmail(email, password, fullName);
        toast.success("Account created! Please check your email to confirm your account.");
      } else {
        await loginWithEmail(email, password);
        toast.success("Welcome back!");
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      // Error is handled by the context and displayed via authError
      console.error("Auth error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, label: "Too short" };
    if (password.length < 8) return { strength: 1, label: "Weak" };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 2, label: "Fair" };
    return { strength: 3, label: "Strong" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Auth Type Toggle */}
      <div className="flex mb-8 bg-white/5 backdrop-blur-sm rounded-lg p-1 border border-white/20">
        <motion.button
          type="button"
          onClick={() => setAuthType("signin")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
            authType === "signin"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
              : "text-white/70 hover:text-white"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Sign In
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setAuthType("signup")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
            authType === "signup"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
              : "text-white/70 hover:text-white"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Sign Up
        </motion.button>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{authError.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {authType === "signup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="fullName" className="text-white/90">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
                disabled={isSubmitting}
              />
              {validationErrors.fullName && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.fullName}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
            disabled={isSubmitting}
          />
          {validationErrors.email && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {validationErrors.email}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {authType === "signup" && password && (
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
          
          {validationErrors.password && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {validationErrors.password}
            </motion.p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {authType === "signup" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="confirmPassword" className="text-white/90">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm pr-10"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && password === confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-green-400 text-sm flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Passwords match
                </motion.p>
              )}
              {validationErrors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm flex items-center gap-1"
                >
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.confirmPassword}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {authType === "signin" ? "Signing in..." : "Creating account..."}
            </>
          ) : (
            authType === "signin" ? "Sign In" : "Create Account"
          )}
        </Button>
      </form>
    </div>
  );
};

export default EnhancedAuthForm;
