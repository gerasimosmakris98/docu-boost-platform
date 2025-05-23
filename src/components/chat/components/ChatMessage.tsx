
import { useState, useEffect } from "react";
import { 
  Bot, 
  User as UserIcon, 
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  List,
  ListOrdered
} from "lucide-react";
import { Message } from "@/services/types/conversationTypes";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth/useAuth";
import ChatAttachment from "./ChatAttachment";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessageProps {
  message: Message;
  isModern?: boolean;
}

const ChatMessage = ({ message, isModern = false }: ChatMessageProps) => {
  const { user } = useAuth();
  const isUserMessage = message.role === 'user';
  const isThinking = message.id?.startsWith('temp-ai');
  const [liked, setLiked] = useState<boolean | null>(null);
  const [contentFormat, setContentFormat] = useState<'normal' | 'bullets' | 'numbered'>('normal');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContentLong, setIsContentLong] = useState(false);
  
  // Check if content is long and should be truncated
  useEffect(() => {
    if (!isUserMessage && message.content.length > 500 && !isExpanded) {
      setIsContentLong(true);
    } else {
      setIsContentLong(false);
    }
  }, [message.content, isExpanded, isUserMessage]);
  
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-1">
        {message.attachments.map((url, index) => (
          <ChatAttachment key={index} url={url} />
        ))}
      </div>
    );
  };
  
  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied to clipboard");
  };
  
  const handleFeedback = (isPositive: boolean) => {
    setLiked(isPositive);
    
    // Show feedback toast
    if (isPositive) {
      toast.success("Thanks for your feedback!");
    } else {
      toast.success("Thanks for your feedback. We'll improve our responses.");
    }
    
    // In a real implementation, this would send feedback to the backend
    console.log("Feedback submitted:", isPositive ? "positive" : "negative", "for message:", message.id);
  };
  
  const formatContent = (content: string) => {
    if (contentFormat === 'normal') return content;
    
    // Split content by paragraphs or newlines
    const paragraphs = content.split(/\n\n|\n/).filter(p => p.trim() !== '');
    
    if (contentFormat === 'bullets') {
      return paragraphs.map(p => `• ${p}`).join('\n\n');
    } else if (contentFormat === 'numbered') {
      return paragraphs.map((p, i) => `${i + 1}. ${p}`).join('\n\n');
    }
    
    return content;
  };
  
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, h:mm a');
    } catch (e) {
      return '';
    }
  };
  
  // Process citations in format [1], [2], etc. and make them clickable
  const processContentWithCitations = (content: string) => {
    // Make citation references clickable
    let processedContent = content.replace(/\[(\d+)\]/g, '<a href="#citation-$1" class="inline-flex items-center justify-center h-5 w-5 text-xs bg-blue-900/30 text-blue-300 rounded-full mx-0.5 hover:bg-blue-800/50 transition-colors">$1</a>');
    
    // Handle URLs - make them clickable
    processedContent = processedContent.replace(
      /(https?:\/\/[^\s]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 hover:underline transition-colors">$1</a>'
    );
    
    return processedContent;
  };
  
  const getTruncatedContent = (content: string, maxLength = 350) => {
    if (content.length <= maxLength) return content;
    
    // Try to find a good breaking point (end of sentence or paragraph)
    const breakPoint = content.substring(0, maxLength).lastIndexOf('.');
    const endPoint = breakPoint > maxLength * 0.7 ? breakPoint + 1 : maxLength;
    
    return content.substring(0, endPoint) + '...';
  };
  
  const formattedContent = isUserMessage ? message.content : formatContent(message.content);
  const displayContent = isContentLong && !isExpanded ? 
    getTruncatedContent(formattedContent) : formattedContent;
  
  // Modern design
  if (isModern) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex gap-4 max-w-3xl mx-auto",
          isUserMessage ? "flex-row" : "flex-row"
        )}
      >
        <Avatar className={cn(
          "h-8 w-8 mt-1",
          isUserMessage ? "bg-green-500/10 border border-green-500/20" : "bg-gray-700/50 border border-gray-600/30"
        )}>
          {isUserMessage ? (
            <>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-white bg-green-700">
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="" />
              <AvatarFallback className="text-white bg-gradient-to-r from-green-400 to-blue-500">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </>
          )}
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <div className="font-medium text-sm">
              {isUserMessage ? "You" : "AI Career Advisor"}
            </div>
            <div className="text-xs text-gray-400">
              {formatDateTime(message.created_at)}
            </div>
          </div>
          
          <div className={cn(
            "text-sm",
            isThinking ? "text-gray-400" : "text-white"
          )}>
            {isThinking ? (
              <motion.div 
                className="flex items-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                <span>Thinking...</span>
              </motion.div>
            ) : (
              <div>
                {isUserMessage ? (
                  <>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {renderAttachments()}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div 
                      className="prose prose-invert max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4"
                      dangerouslySetInnerHTML={{ __html: processContentWithCitations(displayContent) }}
                    />
                    
                    {isContentLong && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </motion.button>
                    )}
                    
                    {/* Feedback and actions for AI messages */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 mt-2 border-t border-gray-800">
                      {/* Feedback buttons */}
                      <div className="flex items-center gap-1 mr-2">
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button 
                            variant={liked === true ? "default" : "ghost"} 
                            size="icon" 
                            className={cn(
                              "h-6 w-6 transition-all",
                              liked === true && "bg-green-600 hover:bg-green-700"
                            )}
                            onClick={() => handleFeedback(true)}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                        </motion.div>
                        <motion.div whileTap={{ scale: 0.9 }}>
                          <Button 
                            variant={liked === false ? "default" : "ghost"} 
                            size="icon" 
                            className={cn(
                              "h-6 w-6 transition-all",
                              liked === false && "bg-red-600 hover:bg-red-700"
                            )}
                            onClick={() => handleFeedback(false)}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>
                        </motion.div>
                      </div>
                      
                      {/* Separator */}
                      <div className="h-4 w-px bg-gray-700 mx-1" />
                      
                      {/* Format buttons */}
                      <div className="flex items-center gap-1">
                        <Button
                          variant={contentFormat === 'normal' ? "default" : "ghost"}
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setContentFormat('normal')}
                          title="Normal text"
                        >
                          <span className="text-xs font-mono">T</span>
                        </Button>
                        <Button
                          variant={contentFormat === 'bullets' ? "default" : "ghost"}
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setContentFormat('bullets')}
                          title="Bullet points"
                        >
                          <List className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant={contentFormat === 'numbered' ? "default" : "ghost"}
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setContentFormat('numbered')}
                          title="Numbered list"
                        >
                          <ListOrdered className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      
                      {/* Separator */}
                      <div className="h-4 w-px bg-gray-700 mx-1" />
                      
                      {/* Copy button */}
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleCopyText}
                          title="Copy text"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Classic design
  return (
    <div 
      className={cn(
        "py-4 px-4 md:px-6 flex gap-4",
        isUserMessage ? "bg-gray-900" : "bg-gray-950"
      )}
    >
      <Avatar className="h-8 w-8">
        {isUserMessage ? (
          <>
            <AvatarImage src="" />
            <AvatarFallback className="bg-green-700 text-white">
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className="flex flex-col flex-1 gap-1 min-w-0">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-300">
            {isUserMessage ? "You" : "AI Assistant"}
          </div>
          <div className="text-xs text-gray-400">
            {formatDateTime(message.created_at)}
          </div>
        </div>
        
        <div className="text-sm text-gray-100">
          {isThinking ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          ) : isUserMessage ? (
            <>
              <div className="whitespace-pre-wrap">{message.content}</div>
              {renderAttachments()}
            </>
          ) : (
            <div className="space-y-3">
              <div 
                className="prose prose-invert max-w-none text-gray-100"
                dangerouslySetInnerHTML={{ __html: processContentWithCitations(displayContent) }}
              />
              
              {isContentLong && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {isExpanded ? "Show less" : "Show more"}
                </button>
              )}
              
              {/* Feedback and actions for AI messages */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-gray-800">
                {/* Feedback buttons */}
                <div className="flex items-center gap-1 mr-2">
                  <Button 
                    variant={liked === true ? "default" : "ghost"} 
                    size="icon" 
                    className={cn(
                      "h-6 w-6 transition-colors",
                      liked === true && "bg-green-600 hover:bg-green-700"
                    )}
                    onClick={() => handleFeedback(true)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant={liked === false ? "default" : "ghost"} 
                    size="icon" 
                    className={cn(
                      "h-6 w-6 transition-colors",
                      liked === false && "bg-red-600 hover:bg-red-700"
                    )}
                    onClick={() => handleFeedback(false)}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {/* Separator */}
                <div className="h-4 w-px bg-gray-700 mx-1" />
                
                {/* Format buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setContentFormat('normal')}
                    title="Normal text"
                  >
                    <span className="text-xs font-mono">T</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setContentFormat('bullets')}
                    title="Bullet points"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setContentFormat('numbered')}
                    title="Numbered list"
                  >
                    <ListOrdered className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                {/* Separator */}
                <div className="h-4 w-px bg-gray-700 mx-1" />
                
                {/* Copy button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopyText}
                  title="Copy text"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
