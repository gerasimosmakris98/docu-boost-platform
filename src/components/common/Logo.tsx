
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
        <Briefcase className="h-8 w-8 text-green-500" />
      </div>
      <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
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
