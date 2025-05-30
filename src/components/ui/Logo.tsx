
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withLink?: boolean;
  className?: string;
  showIcon?: boolean;
}

const Logo = ({ size = "md", withLink = true, className, showIcon = true }: LogoProps) => {
  const logoContent = (
    <div className={cn(
      "flex items-center gap-2",
      size === "sm" && "scale-75",
      size === "lg" && "scale-110",
      className
    )}>
      {showIcon && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-sm opacity-75 animate-pulse"></div>
          <Bot className={cn(
            "relative text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500",
            size === "sm" ? "h-5 w-5" : size === "lg" ? "h-8 w-8" : "h-6 w-6"
          )} />
        </div>
      )}
      <span className={cn(
        "font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",
        size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"
      )}>
        Echo
      </span>
    </div>
  );

  if (withLink) {
    return (
      <Link to="/chat" className="hover:opacity-90 transition duration-200">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
