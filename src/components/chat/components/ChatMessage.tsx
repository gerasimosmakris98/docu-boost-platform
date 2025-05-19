
import { 
  Bot, 
  User as UserIcon, 
  Loader2 
} from "lucide-react";
import { Message } from "@/services/types/conversationTypes";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import ChatAttachment from "./ChatAttachment";

interface ChatMessageProps {
  message: Message;
  isModern?: boolean;
}

const ChatMessage = ({ message, isModern = false }: ChatMessageProps) => {
  const { user } = useAuth();
  const isUserMessage = message.role === 'user';
  const isThinking = message.id?.startsWith('temp-ai');
  
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
  
  // Modern design
  if (isModern) {
    return (
      <div 
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
              <AvatarFallback className="text-white bg-gray-700">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </>
          )}
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="font-medium text-sm">
            {isUserMessage ? "You" : "AI Career Advisor"}
          </div>
          
          <div className={cn(
            "text-sm",
            isThinking ? "text-gray-400" : "text-white"
          )}>
            {isThinking ? (
              <div className="flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                <span>Thinking...</span>
              </div>
            ) : (
              <div>
                {isUserMessage ? (
                  <>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {renderAttachments()}
                  </>
                ) : (
                  <div className="prose prose-invert max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
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
            <AvatarFallback className="bg-gray-700 text-white">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className="flex flex-col flex-1 gap-1 min-w-0">
        <div className="text-sm font-medium text-gray-300">
          {isUserMessage ? "You" : "AI Assistant"}
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
