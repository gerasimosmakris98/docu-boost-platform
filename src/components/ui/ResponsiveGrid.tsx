
import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  staggerChildren?: boolean;
  animateItems?: boolean;
}

const ResponsiveGrid = ({
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className,
  staggerChildren = false,
  animateItems = false
}: ResponsiveGridProps) => {
  const getGridCols = () => {
    const gridClasses = [];
    
    if (columns.sm) gridClasses.push(`grid-cols-${columns.sm}`);
    if (columns.md) gridClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) gridClasses.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) gridClasses.push(`xl:grid-cols-${columns.xl}`);
    if (columns['2xl']) gridClasses.push(`2xl:grid-cols-${columns['2xl']}`);
    
    return gridClasses.join(' ');
  };

  const gaps = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerChildren ? 0.1 : 0
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  if (animateItems || staggerChildren) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "grid",
          getGridCols(),
          gaps[gap],
          className
        )}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="w-full"
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <div
      className={cn(
        "grid",
        getGridCols(),
        gaps[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
