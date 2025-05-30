
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}

const GradientBackground = ({ children, variant = "primary", className }: GradientBackgroundProps) => {
  const variants = {
    primary: "bg-gradient-to-br from-violet-900 via-blue-900 to-indigo-900",
    secondary: "bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900",
    accent: "bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900"
  };

  return (
    <div className={cn(variants[variant], "relative overflow-hidden", className)}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_white_2px,_transparent_2px)] bg-[length:60px_60px] animate-pulse"></div>
      </div>
      
      {/* Floating gradient orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;
