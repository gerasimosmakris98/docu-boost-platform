
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

const AnimatedBot = () => {
  return (
    <div className="relative">
      {/* Outer glow effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl"
      />
      
      {/* Main bot container */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6 border-2 border-white/20 shadow-2xl"
      >
        <Bot className="h-12 w-12 text-white" />
        
        {/* Sparkles around the bot */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0"
        >
          <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-yellow-300" />
          <Sparkles className="absolute -bottom-2 -left-2 h-3 w-3 text-pink-300" />
          <Sparkles className="absolute top-1/2 -left-3 h-2 w-2 text-blue-300" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AnimatedBot;
