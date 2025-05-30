
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface ActionButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const ActionButton = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  icon, 
  className, 
  onClick, 
  disabled 
}: ActionButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl",
    outline: "border-2 border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden rounded-full font-semibold transition-all duration-300",
          variants[variant],
          sizes[size],
          "group",
          className
        )}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        
        <div className="relative flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </div>
      </Button>
    </motion.div>
  );
};

export default ActionButton;
