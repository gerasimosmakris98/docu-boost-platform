
import { Bot, User, Loader2 } from "lucide-react";
import { Message } from "@/services/conversationService";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isLoading = false }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
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
                {message.attachments.map((url, index) => (
                  <a 
                    key={index} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs block underline text-primary-foreground/80"
                  >
                    {url}
                  </a>
                ))}
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
