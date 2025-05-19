
import { Message } from "@/services/conversationService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User as UserIcon, Loader2, FileText, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
  isThinking?: boolean;
}

const ChatMessage = ({ message, isThinking }: ChatMessageProps) => {
  const isUserMessage = message.role === 'user';
  
  const renderAttachment = (url: string, index: number) => {
    const fileExtension = url.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';
    
    // Get filename from URL
    const fileName = url.split('/').pop() || url;
    
    if (isImage) {
      return (
        <div key={index} className="mt-2">
          <img 
            src={url} 
            alt="Attachment" 
            className="max-w-xs rounded-md border border-gray-800"
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
          className="flex items-center gap-2 text-xs mt-1 p-2 bg-gray-800 rounded-md hover:bg-gray-700"
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
        className="flex items-center gap-2 text-xs mt-1 text-blue-400 hover:text-blue-300"
      >
        <LinkIcon className="h-3 w-3" />
        <span className="truncate">{url}</span>
      </a>
    );
  };

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
            <AvatarFallback className="bg-gray-700 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className="flex flex-col flex-1 gap-1 min-w-0">
        <div className="text-sm font-medium text-gray-300">
          {isUserMessage ? "You" : "AI Career Advisor"}
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
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map((url, index) => renderAttachment(url, index))}
                </div>
              )}
            </>
          ) : (
            <div className="prose prose-invert max-w-none text-gray-100">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
