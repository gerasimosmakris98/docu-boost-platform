
import { ReactNode, HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'interactive' | 'gradient';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  padding?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

const GlassCard = ({ 
  children, 
  variant = 'default',
  blur = 'md',
  border = true,
  shadow = 'lg',
  padding = 'md',
  rounded = 'xl',
  className,
  ...props 
}: GlassCardProps) => {
  const variants = {
    default: "bg-white/5",
    hover: "bg-white/5 hover:bg-white/10 transition-all duration-300",
    interactive: "bg-white/5 hover:bg-white/10 cursor-pointer",
    gradient: "bg-gradient-to-br from-white/10 via-white/5 to-white/2"
  };

  const blurs = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md", 
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl"
  };

  const shadows = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg shadow-black/20",
    xl: "shadow-xl shadow-black/25",
    none: ""
  };

  const paddings = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
    none: ""
  };

  const roundings = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    '2xl': "rounded-2xl",
    '3xl': "rounded-3xl"
  };

  const MotionDiv = variant === 'interactive' ? motion.div : 'div';
  const motionProps = variant === 'interactive' ? {
    whileHover: { scale: 1.02, y: -4 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <MotionDiv
      className={cn(
        "relative overflow-hidden",
        variants[variant],
        blurs[blur],
        border && "border border-white/10",
        shadows[shadow],
        paddings[padding],
        roundings[rounded],
        className
      )}
      {...(motionProps as any)}
      {...props}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </MotionDiv>
  );
};

export default GlassCard;
