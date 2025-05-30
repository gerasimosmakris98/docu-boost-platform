
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
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
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
