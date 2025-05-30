
import { forwardRef, ReactNode, InputHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

interface ModernInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  error?: string;
  success?: string;
  hint?: string;
  variant?: 'default' | 'glass' | 'outline' | 'filled';
  showPasswordToggle?: boolean;
  loading?: boolean;
}

const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(({
  label,
  icon,
  iconPosition = 'left',
  error,
  success,
  hint,
  variant = 'glass',
  showPasswordToggle = false,
  loading = false,
  type = 'text',
  className,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const variants = {
    default: "bg-gray-900 border-gray-700 focus:border-blue-500 text-white",
    glass: "bg-white/5 border-white/10 focus:border-blue-400 text-white backdrop-blur-md",
    outline: "bg-transparent border-white/20 focus:border-blue-400 text-white",
    filled: "bg-gray-800 border-transparent focus:border-blue-500 text-white"
  };

  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="block text-sm font-medium text-white/90"
        >
          {label}
        </motion.label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40">
            {icon}
          </div>
        )}

        {/* Input field */}
        <motion.input
          ref={ref}
          type={inputType}
          className={cn(
            "w-full h-12 px-4 rounded-lg border transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900",
            "placeholder:text-white/40",
            variants[variant],
            icon && iconPosition === 'left' && "pl-10",
            (icon && iconPosition === 'right') || showPasswordToggle && "pr-10",
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
            hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500/50",
            loading && "opacity-50 cursor-not-allowed",
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={loading}
          {...props}
        />

        {/* Right icon / Password toggle / Status icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {hasError && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          
          {hasSuccess && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          
          {icon && iconPosition === 'right' && !showPasswordToggle && !hasError && !hasSuccess && (
            <div className="text-white/40">
              {icon}
            </div>
          )}
        </div>

        {/* Focus ring animation */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 rounded-lg border-2 border-blue-400 pointer-events-none"
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Error, success, or hint message */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-400 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
        
        {success && !error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-green-400 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            {success}
          </motion.p>
        )}
        
        {hint && !error && !success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-white/60"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

ModernInput.displayName = "ModernInput";

export default ModernInput;
