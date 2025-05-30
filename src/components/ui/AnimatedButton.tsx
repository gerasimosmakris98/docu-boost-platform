
import { ReactNode, ButtonHTMLAttributes } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface AnimatedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDragStart' | 'onDrop'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  animation?: 'scale' | 'bounce' | 'pulse' | 'none';
  className?: string;
}

const AnimatedButton = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  animation = 'scale',
  className,
  disabled,
  ...props 
}: AnimatedButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl border-0",
    secondary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl border-0",
    outline: "border-2 border-white/20 bg-transparent hover:bg-white/10 text-white backdrop-blur-sm",
    ghost: "bg-transparent hover:bg-white/10 text-white border-0",
    glass: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-lg",
    gradient: "bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl border-0"
  };

  const sizes = {
    sm: "h-8 px-3 text-sm rounded-md",
    md: "h-10 px-4 text-base rounded-lg",
    lg: "h-12 px-6 text-lg rounded-xl",
    icon: "h-10 w-10 rounded-lg"
  };

  const animations: Record<string, MotionProps> = {
    scale: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      transition: { type: "spring", stiffness: 400, damping: 17 }
    },
    bounce: {
      whileHover: { scale: 1.05, y: -2 },
      whileTap: { scale: 0.95, y: 0 },
      transition: { type: "spring", stiffness: 400, damping: 10 }
    },
    pulse: {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      animate: { boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.7)", "0 0 0 10px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"] },
      transition: { duration: 1.5, repeat: Infinity }
    },
    none: {}
  };

  const isDisabled = disabled || loading;
  const motionProps = animations[animation];

  return (
    <motion.button
      {...motionProps}
      className={cn(
        "relative overflow-hidden font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "group",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      
      {/* Ripple effect container */}
      <div className="absolute inset-0 overflow-hidden rounded-inherit">
        <div className="absolute inset-0 bg-white/10 scale-0 group-active:scale-100 group-active:opacity-50 transition-all duration-200 rounded-inherit" />
      </div>
      
      <div className="relative flex items-center justify-center gap-2">
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {size !== 'icon' && (
          <span className="truncate">{children}</span>
        )}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {size === 'icon' && !loading && icon && icon}
      </div>
    </motion.button>
  );
};

export default AnimatedButton;
