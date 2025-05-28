
import { motion } from "framer-motion";

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-2 p-4">
      <div className="flex items-center gap-1">
        <motion.div
          className="h-2 w-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="h-2 w-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="h-2 w-2 bg-green-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
        />
      </div>
      <span className="text-sm text-gray-400">AI is thinking...</span>
    </div>
  );
};

export default TypingIndicator;
