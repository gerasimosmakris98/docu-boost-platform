
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spin' | 'pulse' | 'bounce' | 'dots' | 'bars';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'spin', 
  color = 'primary',
  className 
}: LoadingSpinnerProps) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  const colors = {
    primary: "text-blue-500",
    secondary: "text-emerald-500", 
    white: "text-white",
    gray: "text-gray-400"
  };

  const sizeValue = sizes[size];

  if (variant === 'spin') {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={cn("inline-block", className)}
        style={{ width: sizeValue, height: sizeValue }}
      >
        <svg
          className={cn("w-full h-full", colors[color])}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={cn(
          "rounded-full",
          colors[color].replace('text-', 'bg-'),
          className
        )}
        style={{ width: sizeValue, height: sizeValue }}
      />
    );
  }

  if (variant === 'bounce') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{ y: [0, -sizeValue * 0.5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.1
            }}
            className={cn(
              "rounded-full",
              colors[color].replace('text-', 'bg-')
            )}
            style={{ 
              width: sizeValue * 0.3, 
              height: sizeValue * 0.3 
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5] 
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2
            }}
            className={cn(
              "rounded-full",
              colors[color].replace('text-', 'bg-')
            )}
            style={{ 
              width: sizeValue * 0.2, 
              height: sizeValue * 0.2 
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn("flex items-end gap-1", className)}>
        {[0, 1, 2, 3].map((index) => (
          <motion.div
            key={index}
            animate={{ 
              scaleY: [1, 2, 1] 
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.1
            }}
            className={cn(
              colors[color].replace('text-', 'bg-')
            )}
            style={{ 
              width: sizeValue * 0.15,
              height: sizeValue * 0.5,
              originY: 1
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;
