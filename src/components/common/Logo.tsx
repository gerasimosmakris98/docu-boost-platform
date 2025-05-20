
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
        <div className="flex">
          <div className="h-7 w-7 rounded-full bg-purple-500/80"></div>
          <div className="h-7 w-7 rounded-full bg-purple-700/80 -ml-3"></div>
        </div>
        <div className="h-7 w-7 rounded-full bg-purple-600/80 absolute -bottom-2 left-1"></div>
      </div>
      <span className="font-bold text-white text-xl tracking-tight">AI Career Advisor</span>
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
