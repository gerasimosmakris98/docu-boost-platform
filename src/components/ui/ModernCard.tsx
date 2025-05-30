
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

const ModernCard = ({ children, className, hover = true, gradient = false, onClick }: ModernCardProps) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10",
        gradient 
          ? "bg-white/5" 
          : "bg-transparent",
        "shadow-xl hover:shadow-2xl transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default ModernCard;
