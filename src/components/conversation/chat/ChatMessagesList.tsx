
import { RefObject, useMemo } from "react";
import UnifiedChatMessage from "@/components/chat/UnifiedChatMessage";
import { Message } from "@/services/conversationService";
import { Loader2 } from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";

interface ChatMessagesListProps {
  messages: Message[];
  loading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
}

interface MessageGroup {
  label: string;
  messages: Message[];
}

const ChatMessagesList = ({ messages, loading, messagesEndRef, onRegenerate, onEdit }: ChatMessagesListProps) => {
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
  
  if (loading && messages.length === 0) {
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
  
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {groupedMessages.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} className="space-y-3 sm:space-y-4">
          <div className="sticky top-0 z-10 flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950 px-2 py-0.5 rounded-full">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {group.messages.map((message, index) => {
              const isLoadingMessage = message.id === undefined || message.id?.startsWith('temp');
              
              return (
                <UnifiedChatMessage 
                  key={message.id || `${group.label}-${index}-${message.created_at}`}
                  message={message}
                  isLoading={isLoadingMessage}
                  onRegenerate={onRegenerate ? () => onRegenerate(message.id || '') : undefined}
                  onEdit={onEdit ? () => onEdit(message.id || '') : undefined}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};

export default ChatMessagesList;
