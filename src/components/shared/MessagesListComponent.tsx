
import { useRef, useEffect, useMemo, useState } from "react";
import { Message } from "@/services/types/conversationTypes";
import { Loader2, Bot, ChevronDown, ChevronUp } from "lucide-react";
import MessageComponent from "./MessageComponent";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday, isThisWeek, isThisMonth, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface MessagesListComponentProps {
  messages: Message[];
  isLoading: boolean;
  isModern?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

interface MessageGroup {
  label: string;
  messages: Message[];
}

const MAX_VISIBLE_MESSAGES = 15; // Number of messages to show by default

const MessagesListComponent = ({ 
  messages, 
  isLoading, 
  isModern = false,
  messagesEndRef: externalMessagesEndRef
}: MessagesListComponentProps) => {
  const internalMessagesEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = externalMessagesEndRef || internalMessagesEndRef;
  const [showAllMessages, setShowAllMessages] = useState(false);
  
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
        // Check if more than 3 months old
        const daysDifference = differenceInDays(new Date(), date);
        if (daysDifference > 90) {
          label = 'Older';
        } else {
          label = format(date, 'MMMM yyyy');
        }
      }
      
      if (!currentGroup || currentGroup.label !== label) {
        currentGroup = { label, messages: [] };
        groups.push(currentGroup);
      }
      
      // Add timestamp to each message
      const messageWithTime = {
        ...message,
        formattedTime: format(date, isToday(date) ? 'h:mm a' : 'MMM d, h:mm a')
      };
      
      currentGroup.messages.push(messageWithTime as Message);
    });
    
    return groups;
  }, [messages]);
  
  // Get visible messages based on showAllMessages state
  const visibleGroups = useMemo(() => {
    if (showAllMessages) return groupedMessages;
    
    // If we have only a few messages, show them all
    if (messages.length <= MAX_VISIBLE_MESSAGES) return groupedMessages;
    
    // For many messages, limit the display and show the most recent ones
    let count = 0;
    const result = [];
    
    // Start from the most recent messages (reverse order)
    for (let i = groupedMessages.length - 1; i >= 0; i--) {
      const group = groupedMessages[i];
      
      if (count + group.messages.length <= MAX_VISIBLE_MESSAGES) {
        // Add the whole group
        result.unshift(group); // Add to beginning since we're going backwards
        count += group.messages.length;
      } else {
        // Add a partial group
        const remainingSlots = MAX_VISIBLE_MESSAGES - count;
        if (remainingSlots > 0) {
          // Take the most recent messages from this group
          const partialMessages = group.messages.slice(group.messages.length - remainingSlots);
          result.unshift({
            label: group.label,
            messages: partialMessages
          });
        }
        break;
      }
    }
    
    return result;
  }, [groupedMessages, showAllMessages, messages.length]);
  
  const hasMoreMessages = messages.length > MAX_VISIBLE_MESSAGES;
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showAllMessages, messagesEndRef]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className={`h-8 w-8 animate-spin ${isModern ? "text-green-500" : "text-primary"}`} />
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center h-full text-center p-6"
      >
        <Bot className={isModern ? "h-12 w-12 mb-4 text-green-500" : "h-10 w-10 mb-4 text-primary"} />
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
      </motion.div>
    );
  }
  
  if (visibleGroups.length === 0) return null;
  
  return (
    <div className={isModern ? "space-y-6 p-4" : "space-y-6"}>
      <AnimatePresence>
        {visibleGroups.map((group, groupIndex) => (
          <motion.div 
            key={`group-${groupIndex}`} 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
          >
            <div className="sticky top-0 z-10 flex items-center gap-2 py-1">
              <div className="h-px flex-1 bg-gray-700"></div>
              <span className="text-xs font-medium text-gray-400 bg-black px-2 py-0.5 rounded-full">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-gray-700"></div>
            </div>
            
            <div className="space-y-6">
              {group.messages.map((message, index) => (
                <MessageComponent 
                  key={message.id || `${group.label}-${index}`}
                  message={message} 
                  isModern={isModern}
                  showTimestamp={true}
                  isLoading={message.id === undefined || message.id?.startsWith('temp')}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {hasMoreMessages && (
        <motion.div 
          className="flex justify-center mt-4 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllMessages(!showAllMessages)}
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-200"
          >
            {showAllMessages ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>View All Messages</span>
              </>
            )}
          </Button>
        </motion.div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesListComponent;
