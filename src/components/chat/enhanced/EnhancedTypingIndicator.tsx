
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const EnhancedTypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 mb-8 w-full"
    >
      {/* Enhanced Avatar with animated glow */}
      <motion.div className="flex-shrink-0">
        <Avatar className="h-12 w-12 border-2 border-cyan-400/60 bg-gradient-to-br from-cyan-500/90 to-teal-600/90 shadow-xl relative">
          {/* Animated outer glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-cyan-400/30"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ filter: 'blur(8px)' }}
          />
          
          <AvatarFallback className="text-white bg-transparent text-lg font-semibold relative">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Bot className="h-6 w-6" />
            </motion.div>
            
            {/* Sparkle animation around the bot */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles className="h-3 w-3 text-yellow-400" />
            </motion.div>
          </AvatarFallback>
        </Avatar>
      </motion.div>

      {/* Enhanced typing bubble */}
      <div className="flex-1 min-w-0 space-y-3 max-w-[calc(100%-5rem)]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-2xl px-6 py-4 shadow-2xl border bg-black/40 border-white/20 backdrop-blur-sm self-start max-w-xs"
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10"
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Enhanced typing dots */}
          <div className="flex items-center gap-2 py-2 relative z-10">
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1], 
                opacity: [0.4, 1, 0.4],
                y: [0, -2, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: 0,
                ease: "easeInOut"
              }}
              className="w-2.5 h-2.5 bg-cyan-400 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1], 
                opacity: [0.4, 1, 0.4],
                y: [0, -2, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: 0.3,
                ease: "easeInOut"
              }}
              className="w-2.5 h-2.5 bg-teal-400 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1], 
                opacity: [0.4, 1, 0.4],
                y: [0, -2, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: 0.6,
                ease: "easeInOut"
              }}
              className="w-2.5 h-2.5 bg-blue-400 rounded-full"
            />
            
            {/* Typing text with fade animation */}
            <motion.span 
              className="text-sm text-white/70 ml-3 font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              AI is crafting your response...
            </motion.span>
          </div>

          {/* Subtle pulse border effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl border border-cyan-400/30"
            animate={{
              opacity: [0, 0.8, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Enhanced status indicator */}
        <motion.div 
          className="text-xs text-white/50 px-2 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-2 h-2 border border-cyan-400/60 border-t-cyan-400 rounded-full"
          />
          <span>Analyzing your request...</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnhancedTypingIndicator;
