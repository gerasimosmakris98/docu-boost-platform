
import { useRef, useEffect, useMemo } from "react";
import { Message } from "@/services/types/conversationTypes";
import { Loader2, Bot } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  isModern?: boolean;
}

interface MessageGroup {
  label: string;
  messages: Message[];
}

const MessagesList = ({ messages, isLoading, isModern = false }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Group messages by time periods
  const groupedMessages = useMemo(() => {
    if (messages.length === 0) return [];
    
    const groups: MessageGroup[] = [];
    let currentGroup: MessageGroup | null = null;
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      let label = '';
      
      if (isToday(date)) {
        label = 'Today';
      } else if (isYesterday(date)) {
        label = 'Yesterday';
      } else if (isThisWeek(date)) {
        label = 'This Week';
      } else if (isThisMonth(date)) {
        label = 'This Month';
      } else {
        label = format(date, 'MMMM yyyy');
      }
      
      if (!currentGroup || currentGroup.label !== label) {
        currentGroup = { label, messages: [] };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push(message);
    });
    
    return groups;
  }, [messages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Bot className={isModern ? "h-12 w-12 mb-4 text-green-500" : "h-10 w-10 mb-4 text-green-500"} />
        <h3 className={isModern ? 
          "text-2xl font-semibold mb-3 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent" : 
          "text-xl font-medium mb-2"
        }>
          {isModern ? "AI Career Advisor" : "Welcome to AI Career Assistant"}
        </h3>
        <p className="text-gray-400 max-w-md">
          {isModern ?
            "Your personal AI assistant for career guidance, resume building, interview preparation, and more." :
            "Ask me anything about resumes, cover letters, interview preparation, or general career advice."}
        </p>
      </div>
    );
  }
  
  if (groupedMessages.length === 0) return null;
  
  return (
    <div className={isModern ? "space-y-6" : ""}>
      {groupedMessages.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="space-y-4">
          <div className="sticky top-0 z-10 flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-gray-700"></div>
            <span className="text-xs font-medium text-gray-400 bg-black px-2 py-0.5 rounded-full">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-gray-700"></div>
          </div>
          
          <div className="space-y-6">
            {group.messages.map((message, index) => (
              <ChatMessage 
                key={message.id || `${group.label}-${index}`}
                message={message} 
                isModern={isModern}
              />
            ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
