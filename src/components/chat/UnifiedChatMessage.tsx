
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

  // Process citations and make them clickable
  const processContentWithCitations = (content: string, sourceUrls?: string[]) => {
    return content.replace(/\[(\d+)\]/g, (match, numberStr) => {
      const originalNumber = numberStr;
      const index = parseInt(numberStr, 10) - 1;

      if (sourceUrls && Array.isArray(sourceUrls) && index >= 0 && index < sourceUrls.length && sourceUrls[index]) {
        const url = sourceUrls[index];
        return `<a href="${url.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 font-medium underline transition-colors">[${originalNumber}]</a>`;
      } else {
        return `<span class="font-semibold text-sky-400">[${originalNumber}]</span>`;
      }
    });
  };
  
  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied to clipboard");
  };
  
  const handleFeedback = async (isPositive: boolean) => {
    if (liked !== null) return;

    if (message.id?.startsWith('temp-') || message.id?.startsWith('error-')) {
      toast.error("Cannot submit feedback for temporary or error messages.");
      return;
    }
    
    setLiked(isPositive);

    try {
      const { error } = await supabase.functions.invoke('record-feedback', {
        body: {
          message_id: message.id,
          conversation_id: message.conversation_id,
          is_positive: isPositive,
        },
      });

      if (error) {
        console.error('Error submitting feedback:', error);
        toast.error(`Failed to submit feedback: ${error.message || 'Please try again.'}`);
        setLiked(null);
      } else {
        toast.success("Feedback submitted. Thank you!");
      }
    } catch (invokeError) {
      console.error('Supabase function invocation error:', invokeError);
      toast.error("Failed to submit feedback due to a network error. Please try again.");
      setLiked(null);
    }
  };
  
  const formatContent = (content: string) => {
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
  
  // Process content for display
  const processContentWithFormatting = (plainText: string) => {
    let processedContent = plainText;
    
    // Add proper paragraph breaks
    processedContent = processedContent.replace(/\n\n/g, '</p><p class="mb-3">');
    processedContent = processedContent.replace(/\n/g, '<br />');
    
    // Wrap in paragraph tags
    if (!processedContent.startsWith('<p')) {
      processedContent = `<p class="mb-3">${processedContent}</p>`;
    }
    
    // Handle ```code``` blocks
    processedContent = processedContent.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const languageClass = lang ? `language-${lang}` : '';
      // Escape HTML entities within the code block to prevent rendering as HTML
      const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre class="${languageClass}" tabIndex="0"><code>${escapedCode}</code></pre>`;
    });
    
    // Handle **bold** text (ensure it doesn't interfere with code blocks already processed)
    // This regex needs to be careful not to match inside <pre> tags if they are already there.
    // However, since we process code blocks first and they become <pre>, this should be okay.
    processedContent = processedContent.replace(/(?<!<pre><code>)\*\*(.*?)\*\*(?!<\/code><\/pre>)/g, '<strong>$1</strong>');
    
    // Handle *italic* text (similar caution)
    processedContent = processedContent.replace(/(?<!<pre><code>)\*(.*?)\*(?!<\/code><\/pre>)/g, '<em>$1</em>');
    
    // Make URLs clickable
    processedContent = processedContent.replace(
      /(?<!href="|src="|<code>)(https?:\/\/[^\s<>"]+)/g, // Avoid matching URLs inside <a>, <img> or <code>
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 hover:underline transition-colors">$1</a>'
    );
    
    return processedContent;
  };
  
  const isContentLong = message.content.length > 500;
  const displayContent = isContentLong && !isExpanded ? 
    message.content.substring(0, 500) + '...' : message.content;

  let finalContentToRender: string;

  if (isUserMessage) {
    finalContentToRender = formatContent(displayContent);
  } else {
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
      aria-label={
        isThinking
          ? `AI Career Advisor is thinking...`
          : `Message from ${isUserMessage ? "You" : "AI Career Advisor"} sent at ${formatDateTime(message.created_at)}`
      }
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
            <span className="sr-only">Sender: </span>{isUserMessage ? "You" : "AI Career Advisor"}
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
                      aria-expanded={isExpanded} // Added aria-expanded
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
                            "h-8 w-8 transition-all", // Increased size
                            liked === true && "bg-green-600 hover:bg-green-700 text-white",
                            liked !== null && liked !== true && "opacity-50",
                          )}
                          onClick={() => handleFeedback(true)}
                          disabled={liked !== null || message.id?.startsWith('temp-') || message.id?.startsWith('error-')}
                        >
                          <ThumbsUp className="h-4 w-4" /> {/* Increased icon size */}
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }}>
                        <Button 
                          variant={liked === false ? "default" : "ghost"} 
                          size="icon" 
                          className={cn(
                            "h-8 w-8 transition-all", // Increased size
                            liked === false && "bg-red-600 hover:bg-red-700 text-white",
                            liked !== null && liked !== false && "opacity-50",
                          )}
                          onClick={() => handleFeedback(false)}
                          disabled={liked !== null || message.id?.startsWith('temp-') || message.id?.startsWith('error-')}
                        >
                          <ThumbsDown className="h-4 w-4" /> {/* Increased icon size */}
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
                        className="h-8 w-8" // Increased size
                        onClick={() => setContentFormat('normal')}
                        title="Normal text"
                      >
                        <span className="text-sm font-mono">T</span> {/* Adjusted icon size for T */}
                      </Button>
                      <Button
                        variant={contentFormat === 'bullets' ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8" // Increased size
                        onClick={() => setContentFormat('bullets')}
                        title="Bullet points"
                      >
                        <List className="h-4 w-4" /> {/* Increased icon size */}
                      </Button>
                      <Button
                        variant={contentFormat === 'numbered' ? "default" : "ghost"}
                        size="icon"
                        className="h-8 w-8" // Increased size
                        onClick={() => setContentFormat('numbered')}
                        title="Numbered list"
                      >
                        <ListOrdered className="h-4 w-4" /> {/* Increased icon size */}
                      </Button>
                    </div>
                    
                    {/* Separator */}
                    <div className="h-4 w-px bg-gray-700 mx-1" />
                    
                    {/* Copy button */}
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8" // Increased size
                        onClick={handleCopyText}
                        title="Copy text"
                      >
                        <Copy className="h-4 w-4" /> {/* Increased icon size */}
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
