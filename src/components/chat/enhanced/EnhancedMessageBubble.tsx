
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Copy, RefreshCw, Edit3, Heart, ThumbsUp, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Message } from "@/services/conversationService";

interface EnhancedMessageBubbleProps {
  message: Message;
  isLoading?: boolean;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  animationDelay?: number;
}

const EnhancedMessageBubble = ({ 
  message,
  isLoading,
  onRegenerate,
  onEdit,
  animationDelay = 0
}: EnhancedMessageBubbleProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const isUser = message.role === 'user';
  const timestamp = new Date(message.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("Message copied to clipboard", { duration: 2000 });
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const handleReaction = (type: 'like' | 'love') => {
    toast.success(`You ${type}d this message`, { duration: 1500 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: animationDelay,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={cn(
        "flex gap-4 mb-8 group w-full relative",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setTimeout(() => setShowActions(false), 200);
      }}
    >
      {/* Enhanced Avatar with glow effect */}
      <motion.div 
        className="flex-shrink-0"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Avatar className={cn(
          "h-12 w-12 border-2 shadow-xl relative",
          isUser 
            ? "border-blue-400/60 bg-gradient-to-br from-blue-500/90 to-purple-600/90" 
            : "border-cyan-400/60 bg-gradient-to-br from-cyan-500/90 to-teal-600/90"
        )}>
          {/* Outer glow effect */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
              isUser ? "bg-blue-400/20" : "bg-cyan-400/20"
            )}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1.2 : 1
            }}
            style={{ filter: 'blur(8px)' }}
          />
          
          {isUser ? (
            <>
              <AvatarImage src="" />
              <AvatarFallback className="text-white bg-transparent text-lg font-semibold">
                <User className="h-6 w-6" />
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="" />
              <AvatarFallback className="text-white bg-transparent text-lg font-semibold relative">
                <Bot className="h-6 w-6" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Sparkles className="h-3 w-3 text-yellow-400" />
                </motion.div>
              </AvatarFallback>
            </>
          )}
        </Avatar>
      </motion.div>

      {/* Message Content Container */}
      <div className={cn(
        "flex-1 min-w-0 space-y-3 max-w-[calc(100%-5rem)]",
        isUser ? "text-right items-end" : "text-left items-start",
        "flex flex-col"
      )}>
        {/* Message Bubble with enhanced animations */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: animationDelay + 0.1 }}
          className={cn(
            "relative rounded-2xl px-6 py-4 shadow-2xl border backdrop-blur-sm",
            "transform transition-all duration-300 hover:shadow-3xl",
            isUser
              ? "bg-gradient-to-br from-blue-600/95 to-purple-700/95 text-white border-blue-400/30 self-end hover:from-blue-500/95 hover:to-purple-600/95"
              : "bg-black/40 text-white border-white/20 self-start hover:bg-black/50"
          )}
          style={{
            maxWidth: isUser ? "85%" : "90%"
          }}
        >
          {/* Message content with loading animation */}
          {isLoading ? (
            <motion.div 
              className="flex items-center gap-3 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-3 h-3 bg-current rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-3 h-3 bg-current rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-3 h-3 bg-current rounded-full"
              />
              <span className="text-sm text-white/70 ml-2">AI is thinking...</span>
            </motion.div>
          ) : (
            <motion.div 
              className="prose prose-invert max-w-none text-sm leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: animationDelay + 0.2 }}
            >
              {message.content}
            </motion.div>
          )}

          {/* Message actions overlay */}
          <AnimatePresence>
            {showActions && !isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute -bottom-12 flex gap-1 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20",
                  isUser ? "left-0" : "right-0"
                )}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                
                {!isUser && onRegenerate && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRegenerate}
                    className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
                
                {isUser && onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit && onEdit(message.content)}
                    className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}

                {/* Reaction buttons */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReaction('like')}
                  className="h-8 w-8 p-0 text-white/70 hover:text-blue-400 hover:bg-blue-500/20 rounded-full transition-all"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleReaction('love')}
                  className="h-8 w-8 p-0 text-white/70 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all"
                >
                  <Heart className="h-3 w-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced timestamp with status indicators */}
        <motion.div 
          className={cn(
            "text-xs text-white/50 px-2 flex items-center gap-2",
            isUser ? "text-right justify-end" : "text-left justify-start"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 0.3 }}
        >
          <span>{timestamp}</span>
          {message.sourceUrls && message.sourceUrls.length > 0 && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1 text-blue-400"
            >
              <Sparkles className="h-3 w-3" />
              <span className="text-xs">Enhanced</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EnhancedMessageBubble;
