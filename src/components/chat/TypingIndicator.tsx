
import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 p-3 sm:p-4">
      <div className="flex items-center gap-1">
        <motion.div
          className="h-2 w-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="h-2 w-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-2 w-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <motion.span 
        className="text-sm text-gray-400"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        AI is thinking...
      </motion.span>
    </div>
  );
};

export default TypingIndicator;
