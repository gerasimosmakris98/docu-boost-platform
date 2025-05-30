
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}

const GradientBackground = ({ children, variant = "primary", className }: GradientBackgroundProps) => {
  const variants = {
    primary: "bg-gradient-to-br from-slate-900 via-blue-900 to-black",
    secondary: "bg-gradient-to-br from-slate-900 via-indigo-900 to-black",
    accent: "bg-gradient-to-br from-blue-900 via-slate-900 to-black"
  };

  return (
    <div className={cn(variants[variant], "min-h-screen", className)}>
      {children}
    </div>
  );
};

export default GradientBackground;
