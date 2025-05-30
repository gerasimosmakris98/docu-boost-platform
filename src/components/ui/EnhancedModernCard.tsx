
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnhancedModernCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'hover' | 'interactive' | 'gradient' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  animated?: boolean;
}

const EnhancedModernCard = ({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  onClick, 
  animated = true 
}: EnhancedModernCardProps) => {
  const variants = {
    default: "bg-white/5 border-white/10",
    hover: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
    interactive: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer",
    gradient: "bg-gradient-to-br from-white/10 via-white/5 to-white/2 border-white/20",
    glow: "bg-white/5 border-white/10 shadow-2xl shadow-blue-500/20"
  };

  const sizes = {
    sm: "p-3 rounded-lg",
    md: "p-4 rounded-xl", 
    lg: "p-6 rounded-2xl",
    xl: "p-8 rounded-3xl"
  };

  const motionProps = animated ? {
    whileHover: variant === 'interactive' ? { scale: 1.02, y: -4 } : { scale: 1.01 },
    whileTap: onClick ? { scale: 0.98 } : {},
    transition: { duration: 0.2 }
  } : {};

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden backdrop-blur-md border",
        "transition-all duration-300",
        variants[variant],
        sizes[size],
        className
      )}
      {...motionProps}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
      
      {/* Glow effect for glow variant */}
      {variant === 'glow' && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default EnhancedModernCard;
