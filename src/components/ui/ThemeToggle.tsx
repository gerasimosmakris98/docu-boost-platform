
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/theme/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'tabs';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ThemeToggle = ({ variant = 'button', size = 'md', className }: ThemeToggleProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  if (variant === 'button') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={cn(
          "relative rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm",
          "flex items-center justify-center transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          sizes[size],
          className
        )}
        aria-label="Toggle theme"
      >
        <motion.div
          initial={false}
          animate={{
            scale: resolvedTheme === 'dark' ? 1 : 0,
            opacity: resolvedTheme === 'dark' ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Moon className={cn("text-blue-400", iconSizes[size])} />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: resolvedTheme === 'light' ? 1 : 0,
            opacity: resolvedTheme === 'light' ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          <Sun className={cn("text-yellow-400", iconSizes[size])} />
        </motion.div>
      </motion.button>
    );
  }

  if (variant === 'tabs') {
    const themes = [
      { key: 'light', icon: Sun, label: 'Light' },
      { key: 'dark', icon: Moon, label: 'Dark' },
      { key: 'system', icon: Monitor, label: 'System' }
    ] as const;

    return (
      <div className={cn("flex items-center bg-white/5 rounded-lg p-1 border border-white/10", className)}>
        {themes.map(({ key, icon: Icon, label }) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(key)}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              theme === key 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
            
            {theme === key && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-blue-600 rounded-md -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    );
  }

  return null;
};

export default ThemeToggle;
