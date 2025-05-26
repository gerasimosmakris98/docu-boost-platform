import { useState } from "react";
import { motion } from "framer-motion";
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
import { Message } from "@/services/conversationService";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { supabase } from '@/integrations/supabase/client';

interface UnifiedChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const UnifiedChatMessage = ({ message, isLoading = false }: UnifiedChatMessageProps) => {
  const { user } = useAuth();
  const isUserMessage = message.role === 'user';
  const isThinking = message.id?.startsWith('temp-ai') || isLoading;
  const [liked, setLiked] = useState<boolean | null>(null);
  const [contentFormat, setContentFormat] = useState<'normal' | 'bullets' | 'numbered'>('normal');
  const [isExpanded, setIsExpanded] = useState(false);

  // Adapted from ChatMessage.tsx
  // Process citations in format [1], [2], etc. and make them visually distinct,
  // linking them if a corresponding URL is available.
  const processContentWithCitations = (content: string, sourceUrls?: string[]) => {
    return content.replace(/\[(\d+)\]/g, (match, numberStr) => {
      const originalNumber = numberStr;
      const index = parseInt(numberStr, 10) - 1;

      if (sourceUrls && Array.isArray(sourceUrls) && index >= 0 && index < sourceUrls.length && typeof sourceUrls[index] === 'string' && sourceUrls[index]) {
        // Valid URL found, create a link
        const url = sourceUrls[index];
        // Escape HTML attributes properly for security
        return `<a href="${url.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 font-medium underline transition-colors">[${originalNumber}]</a>`;
      } else {
        // No valid URL, return the non-clickable styled span (adjusted style for UnifiedChatMessage)
        return `<span class="font-semibold text-sky-400">[${originalNumber}]</span>`;
      }
    });
  };
  
  const handleCopyText = () => {
    // message.content is now plain text
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied to clipboard");
  };
  
  const handleFeedback = async (isPositive: boolean) => {
    if (liked !== null) { // Already submitted
      return;
    }

    // Prevent feedback on temporary messages
    if (message.id?.startsWith('temp-') || message.id?.startsWith('error-')) {
      toast.error("Cannot submit feedback for temporary or error messages.");
      return;
    }
    
    // Optimistic UI update
    setLiked(isPositive);

    try {
      const { error } = await supabase.functions.invoke('record-feedback', {
        body: {
          message_id: message.id,
          conversation_id: message.conversation_id,
          is_positive: isPositive,
          // feedback_text is optional and not collected here
        },
      });

      if (error) {
        console.error('Error submitting feedback:', error);
        toast.error(`Failed to submit feedback: ${error.message || 'Please try again.'}`);
        setLiked(null); // Revert optimistic update on error
      } else {
        toast.success("Feedback submitted. Thank you!");
        // Buttons will remain disabled due to `liked` state
      }
    } catch (invokeError) {
      console.error('Supabase function invocation error:', invokeError);
      toast.error("Failed to submit feedback due to a network or function error. Please try again.");
      setLiked(null); // Revert optimistic update on error
    }
  };
  
  const formatContent = (content: string) => {
    // content is already plain text
    if (contentFormat === 'normal') return content;
    
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
  
  // Process content to add proper formatting (markdown-like features)
  const processContentWithFormatting = (plainText: string) => {
    let processedContent = plainText;
    
    // Add proper paragraph breaks
    // Ensure this doesn't mess up code blocks if we add them later, for now it's fine.
    processedContent = processedContent.replace(/\n\n/g, '</p><p class="mb-3">');
    processedContent = processedContent.replace(/\n/g, '<br />');
    
    // Wrap in paragraph tags
    if (!processedContent.startsWith('<p')) {
      processedContent = `<p class="mb-3">${processedContent}</p>`;
    }
    
    // Handle **bold** text
    processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle *italic* text
    processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Make URLs clickable (ensure this doesn't conflict with citation links later)
    // This regex tries to avoid matching URLs already in href attributes.
    processedContent = processedContent.replace(
      /(?<!href="|src=")(https?:\/\/[^\s<>"]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 hover:underline transition-colors">$1</a>'
    );
    
    return processedContent;
  };
  
  const isContentLong = message.content.length > 500;
  const displayContent = isContentLong && !isExpanded ? 
    message.content.substring(0, 500) + '...' : message.content;

  let finalContentToRender: string;

  if (isUserMessage) {
    finalContentToRender = formatContent(displayContent); // User message remains plain text (or with list formatting)
  } else {
    // AI Message
    const textAfterPossibleListFormatting = formatContent(displayContent);
    let htmlWithBasicMarkdown = processContentWithFormatting(textAfterPossibleListFormatting);

    if (message.sourceUrls && message.sourceUrls.length > 0) {
      finalContentToRender = processContentWithCitations(htmlWithBasicMarkdown, message.sourceUrls);
    } else {
      finalContentToRender = htmlWithBasicMarkdown;
    }
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-4 max-w-4xl mx-auto p-4",
        isUserMessage ? "flex-row" : "flex-row"
      )}
    >
      <Avatar className={cn(
        "h-8 w-8 mt-1 border",
        isUserMessage ? "bg-green-500/10 border-green-500/20" : "bg-gray-700/50 border-gray-600/30"
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
      
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="font-medium text-sm text-gray-300">
            {isUserMessage ? "You" : "AI Career Advisor"}
          </div>
          <div className="text-xs text-gray-500">
            {formatDateTime(message.created_at)}
          </div>
        </div>
        
        <div className={cn(
          "text-sm text-white",
          isThinking && "text-gray-400"
        )}>
          {isThinking ? (
            <motion.div 
              className="flex items-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Thinking...</span>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {isUserMessage ? (
                <div className="whitespace-pre-wrap bg-green-900/20 rounded-lg p-3 border border-green-500/20">
                  {finalContentToRender}
                </div>
              ) : (
                <>
                  <div 
                    className="prose prose-invert max-w-none prose-p:my-2 prose-headings:mb-2 prose-headings:mt-4"
                    dangerouslySetInnerHTML={{ __html: finalContentToRender }}
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
                  
                  {/* Action buttons for AI messages */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-3 border-t border-gray-800">
                    {/* Feedback buttons */}
                    <div className="flex items-center gap-1 mr-2">
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button 
                          variant={liked === true ? "default" : "ghost"} 
                          size="icon" 
                          className={cn(
                            "h-6 w-6 transition-all",
                            liked === true && "bg-green-600 hover:bg-green-700 text-white",
                            liked !== null && liked !== true && "opacity-50", // Dim if other option was chosen or feedback submitted
                          )}
                          onClick={() => handleFeedback(true)}
                          disabled={liked !== null || message.id?.startsWith('temp-') || message.id?.startsWith('error-')}
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button 
                          variant={liked === false ? "default" : "ghost"} 
                          size="icon" 
                          className={cn(
                            "h-6 w-6 transition-all",
                            liked === false && "bg-red-600 hover:bg-red-700 text-white",
                            liked !== null && liked !== false && "opacity-50", // Dim if other option was chosen or feedback submitted
                          )}
                          onClick={() => handleFeedback(false)}
                          disabled={liked !== null || message.id?.startsWith('temp-') || message.id?.startsWith('error-')}
                        >
                          <ThumbsDown className="h-3 w-3" />
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
                        <List className="h-3 w-3" />
                      </Button>
                      <Button
                        variant={contentFormat === 'numbered' ? "default" : "ghost"}
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setContentFormat('numbered')}
                        title="Numbered list"
                      >
                        <ListOrdered className="h-3 w-3" />
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
                        <Copy className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  </div>
                </>
              )}
              
              {/* Render attachments if any */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((url, index) => (
                    <div key={index} className="text-xs text-blue-400 hover:text-blue-300">
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        Attachment {index + 1}
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UnifiedChatMessage;
