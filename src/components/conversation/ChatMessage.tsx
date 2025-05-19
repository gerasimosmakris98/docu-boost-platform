
import { Bot, User, Loader2, FileText, Image as ImageIcon, Link as LinkIcon, Paperclip } from "lucide-react";
import { Message } from "@/services/conversationService";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isLoading = false }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  
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
          <div className="prose dark:prose-invert max-w-none text-sm">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
