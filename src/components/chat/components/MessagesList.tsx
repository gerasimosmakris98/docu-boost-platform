
import { RefObject } from "react";
import UnifiedChatMessage from "@/components/chat/UnifiedChatMessage";
import { Message } from "@/services/conversationService";
import { motion } from "framer-motion";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  isModern?: boolean;
}

const MessagesList = ({ messages, isLoading, isModern = true }: MessagesListProps) => {
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-400">Loading conversation...</p>
        </motion.div>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-full text-center p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-full bg-green-500/10 p-6 border border-green-500/20 mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            🤖
          </motion.div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">Welcome to AI Career Advisor</h3>
        <p className="text-gray-400 mb-4 max-w-md">
          I'm here to help you with your career journey. Ask me about resumes, interviews, job search strategies, or any career-related questions.
        </p>
        <p className="text-sm text-gray-500">
          Start by typing a message below.
        </p>
      </motion.div>
    );
  }
  
  return (
    <div className="space-y-1">
      {messages.map((message, index) => (
        <UnifiedChatMessage
          key={message.id || `msg-${index}-${message.created_at}`}
          message={message}
          isLoading={message.id?.startsWith('temp')}
        />
      ))}
    </div>
  );
};

export default MessagesList;
