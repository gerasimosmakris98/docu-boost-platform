
import { useRef, useEffect } from "react";
import { Message } from "@/services/types/conversationTypes";
import { Loader2, Bot } from "lucide-react";
import ChatMessage from "./ChatMessage";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  isModern?: boolean;
}

const MessagesList = ({ messages, isLoading, isModern = false }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  return (
    <div className={isModern ? "space-y-6" : ""}>
      {messages.map((message, index) => (
        <ChatMessage 
          key={message.id || index} 
          message={message} 
          isModern={isModern}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
