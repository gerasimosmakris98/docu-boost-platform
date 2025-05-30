
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Copy, RefreshCw, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ModernChatBubbleProps {
  children: ReactNode;
  isUser: boolean;
  avatar?: string;
  timestamp?: string;
  isLoading?: boolean;
  onRegenerate?: () => void;
  onEdit?: () => void;
}

const ModernChatBubble = ({ 
  children, 
  isUser, 
  avatar, 
  timestamp, 
  isLoading,
  onRegenerate,
  onEdit
}: ModernChatBubbleProps) => {
  
  const handleCopy = () => {
    const textContent = typeof children === 'string' ? children : '';
    navigator.clipboard.writeText(textContent);
    toast.success("Message copied to clipboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 max-w-4xl mx-auto mb-6 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={cn(
          "h-10 w-10 border-2 shadow-lg backdrop-blur-sm",
          isUser 
            ? "border-blue-300/50 bg-gradient-to-br from-blue-500/80 to-purple-500/80" 
            : "border-cyan-300/50 bg-gradient-to-br from-cyan-500/80 to-teal-500/80"
        )}>
          {isUser ? (
            <>
              <AvatarImage src={avatar} />
              <AvatarFallback className="text-white bg-transparent text-sm">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="" />
              <AvatarFallback className="text-white bg-transparent text-sm">
                <Bot className="h-5 w-5" />
              </AvatarFallback>
            </>
          )}
        </Avatar>
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0 space-y-2",
        isUser ? "text-right" : "text-left"
      )}>
        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "inline-block max-w-[85%] rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm border relative",
            isUser
              ? "bg-gradient-to-br from-blue-600/90 to-purple-600/90 text-white border-blue-300/20 ml-auto"
              : "bg-white/10 text-white border-white/20 mr-auto"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2 py-2">
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
            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
              {children}
            </div>
          )}

          {/* Action Buttons - Only for AI messages */}
          {!isUser && !isLoading && (
            <div className="absolute -bottom-8 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
              >
                <Copy className="h-3 w-3" />
              </Button>
              {onRegenerate && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onRegenerate}
                  className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Action Buttons - Only for User messages */}
          {isUser && !isLoading && onEdit && (
            <div className="absolute -bottom-8 left-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </motion.div>

        {/* Timestamp */}
        {timestamp && (
          <div className={cn(
            "text-xs text-white/50 px-2",
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
