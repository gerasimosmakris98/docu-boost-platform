
import { useState } from "react";
import { 
  Bot, User, Loader2, FileText, Image as ImageIcon, Link as LinkIcon, 
  Paperclip, ThumbsUp, ThumbsDown, Copy, List, ListOrdered
} from "lucide-react";
import { Message } from "@/services/conversationService";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isLoading = false }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<boolean | null>(null);
  const [contentFormat, setContentFormat] = useState<'normal' | 'bullets' | 'numbered'>('normal');
  
  const getAttachmentIcon = (url: string) => {
    const fileExtension = url.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';
    const isUrl = url.startsWith('http') && !isImage && !isPdf;
    
    if (isImage) return <ImageIcon className="h-4 w-4" />;
    if (isPdf) return <FileText className="h-4 w-4" />;
    if (isUrl) return <LinkIcon className="h-4 w-4" />;
    return <Paperclip className="h-4 w-4" />;
  };
  
  const renderAttachment = (url: string, index: number) => {
    const fileExtension = url.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';
    const isUrl = url.startsWith('http') && !isImage && !isPdf;
    
    // Get filename from URL
    const fileName = url.split('/').pop() || url;
    
    if (isImage && !imageError[url]) {
      return (
        <div key={index} className="mt-2">
          <img 
            src={url} 
            alt="Attachment" 
            className="max-w-xs rounded-md border"
            onError={() => setImageError(prev => ({ ...prev, [url]: true }))} 
          />
        </div>
      );
    }
    
    if (isPdf) {
      return (
        <a 
          key={index}
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <FileText className="h-4 w-4" />
          <span className="truncate">{fileName}</span>
        </a>
      );
    }
    
    return (
      <a 
        key={index}
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs mt-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {getAttachmentIcon(url)}
        <span className="truncate">{url}</span>
      </a>
    );
  };
  
  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message copied to clipboard");
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
  
  // Process citations in format [1], [2], etc. and make them visually distinct,
  // linking them if a corresponding URL is available.
  const processContentWithCitations = (content: string, sourceUrls?: string[]) => {
    return content.replace(/\[(\d+)\]/g, (match, numberStr) => {
      const originalNumber = numberStr;
      const index = parseInt(numberStr, 10) - 1;

      if (sourceUrls && Array.isArray(sourceUrls) && index >= 0 && index < sourceUrls.length && typeof sourceUrls[index] === 'string' && sourceUrls[index]) {
        // Valid URL found, create a link
        const url = sourceUrls[index];
        // Escape HTML attributes properly for security, though template literals with trusted vars are generally okay.
        // For URLs from external sources, further sanitization might be needed if they weren't already validated.
        return `<a href="${url.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium underline">[${originalNumber}]</a>`;
      } else {
        // No valid URL, return the non-clickable styled span
        return `<span class="inline-flex items-center justify-center h-5 w-5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mx-0.5">${originalNumber}</span>`;
      }
    });
  };
  
  const formattedContent = isUser 
    ? message.content 
    : processContentWithCitations(formatContent(message.content), message.sourceUrls);
  
  return (
    <div className={cn("flex items-start gap-3 max-w-4xl mx-auto", isUser && "flex-row-reverse")}>
      <Avatar className={cn("h-8 w-8 border", isUser ? "bg-primary/10 border-primary/20" : "bg-muted/50 border-muted")}>
        {isUser ? (
          <>
            <AvatarImage src="" />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="" />
            <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className={cn(
        "rounded-lg px-4 py-2.5 max-w-[calc(100%-44px)]",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
      )}>
        {isLoading ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI is thinking...</span>
          </div>
        ) : isUser ? (
          <div className="prose dark:prose-invert max-w-none">
            <p>{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((url, index) => renderAttachment(url, index))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="prose dark:prose-invert max-w-none text-sm break-words" dangerouslySetInnerHTML={{ __html: formattedContent }} />
            
            {/* Feedback and actions for AI messages */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 mt-2 border-t border-gray-200 dark:border-gray-700">
              {/* Feedback buttons */}
              <div className="flex items-center gap-1 mr-2">
                <Button 
                  variant={liked === true ? "default" : "ghost"} 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setLiked(true)}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant={liked === false ? "default" : "ghost"} 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setLiked(false)}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              {/* Separator */}
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />
              
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
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />
              
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
  );
};

export default ChatMessage;
