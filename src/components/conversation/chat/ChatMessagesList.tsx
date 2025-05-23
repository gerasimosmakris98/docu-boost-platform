
import { RefObject, useMemo } from "react";
import ChatMessage from "@/components/conversation/ChatMessage";
import { Message } from "@/services/conversationService";
import { Loader2 } from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";

interface ChatMessagesListProps {
  messages: Message[];
  loading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

interface MessageGroup {
  label: string;
  messages: Message[];
}

const ChatMessagesList = ({ messages, loading, messagesEndRef }: ChatMessagesListProps) => {
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <p className="text-muted-foreground mb-2">No messages yet</p>
        <p className="text-sm text-muted-foreground">
          Start a conversation by sending a message below.
        </p>
      </div>
    );
  }
  
  // Format long messages for better readability
  const formatMessageContent = (content: string) => {
    // Keep the character limit reasonable
    const maxPreviewLength = 1000;
    
    // If the message is too long, truncate it and add an ellipsis
    if (content.length > maxPreviewLength) {
      return content.substring(0, maxPreviewLength) + "...";
    }
    
    return content;
  };
  
  return (
    <div className="space-y-6">
      {groupedMessages.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="space-y-4">
          <div className="sticky top-0 z-10 flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950 px-2 py-0.5 rounded-full">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
          </div>
          
          <div className="space-y-4">
            {group.messages.map((message, index) => {
              // Format the message content for better display
              const formattedContent = formatMessageContent(message.content);
              
              // Clone the message and update its content
              const displayMessage = {
                ...message,
                content: formattedContent
              };
              
              return (
                <ChatMessage 
                  key={message.id || `${group.label}-${index}`}
                  message={displayMessage}
                  isLoading={message.id === undefined || message.id?.startsWith('temp')}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessagesList;
