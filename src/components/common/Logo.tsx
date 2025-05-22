
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withLink?: boolean;
  className?: string;
}

const Logo = ({ size = "md", withLink = true, className }: LogoProps) => {
  const logoContent = (
    <div className={cn(
      "flex items-center gap-2",
      size === "sm" && "scale-75",
      size === "lg" && "scale-110",
      className
    )}>
      <div className="relative">
        {/* Briefcase icon with gradient */}
        <div className="relative">
          <Briefcase className={cn(
            "text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500",
            size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8"
          )} />
        </div>
      </div>
      <span className={cn(
        "font-bold tracking-tight bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent",
        size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl"
      )}>
        AI Career Advisor
      </span>
    </div>
  );

  if (withLink) {
    return (
      <Link to="/" className="hover:opacity-90 transition duration-200">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
