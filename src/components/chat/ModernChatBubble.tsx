
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface ModernChatBubbleProps {
  children: ReactNode;
  isUser: boolean;
  avatar?: string;
  timestamp?: string;
  isLoading?: boolean;
}

const ModernChatBubble = ({ children, isUser, avatar, timestamp, isLoading }: ModernChatBubbleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-4 max-w-4xl mx-auto mb-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={cn(
          "h-12 w-12 border-2 shadow-lg backdrop-blur-sm",
          isUser 
            ? "border-blue-300/50 bg-gradient-to-br from-blue-500/80 to-purple-500/80" 
            : "border-cyan-300/50 bg-gradient-to-br from-cyan-500/80 to-teal-500/80"
        )}>
          {isUser ? (
            <>
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-white bg-transparent">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="" />
              <AvatarFallback className="text-white bg-transparent">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </>
          )}
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "inline-block max-w-[85%] rounded-2xl px-6 py-4 shadow-xl backdrop-blur-sm border",
            isUser
              ? "bg-gradient-to-br from-blue-600/90 to-purple-600/90 text-white border-blue-300/20"
              : "bg-white/10 text-white border-white/20"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-current rounded-full opacity-60"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-current rounded-full opacity-60"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-current rounded-full opacity-60"
              />
            </div>
          ) : (
            children
          )}
        </motion.div>

        {/* Timestamp */}
        {timestamp && (
          <div className={cn(
            "text-xs text-white/50 mt-2 px-2",
            isUser ? "text-right" : "text-left"
          )}>
            {timestamp}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ModernChatBubble;
