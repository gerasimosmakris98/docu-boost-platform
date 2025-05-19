
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatInterfaceProps {
  conversationId?: string;
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
}

const ChatInterface = ({ 
  conversationId, 
  conversation, 
  messages: initialMessages, 
  isLoading 
}: ChatInterfaceProps) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async (
    messageText: string, 
    attachments: { url: string; type: string; name: string }[]
  ) => {
    if (!messageText.trim() && attachments.length === 0) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to send messages");
      navigate("/auth");
      return;
    }
    if (!conversationId) {
      toast.error("Invalid conversation");
      return;
    }
    
    // Create attachment URLs array
    const attachmentUrls = attachments.map(a => a.url);
    
    // Add user message to UI immediately
    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
      attachments: attachmentUrls
    };
    
    setMessages(prev => [...prev, optimisticUserMessage]);
    
    // Add AI thinking message
    const optimisticAiMessage: Message = {
      id: `temp-ai-${Date.now()}`,
      conversation_id: conversationId,
      role: 'assistant',
      content: "...",
      created_at: new Date().toISOString()
    };
    
    setIsSending(true);
    setMessages(prev => [...prev, optimisticAiMessage]);
    
    try {
      // Send the message
      const response = await conversationService.sendMessage(conversationId, messageText, attachmentUrls);
      
      // Update messages with real AI response
      if (response && response.aiResponse) {
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(response.aiResponse)
        );
      } else {
        // If no AI response, remove the loading message
        setMessages(prev => prev.filter(msg => msg.id !== optimisticAiMessage.id));
        toast.error("Failed to get AI response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => prev.filter(msg => msg.id !== optimisticAiMessage.id));
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2 text-green-500" />
          <h2 className="text-lg font-medium">
            {conversation?.title || "AI Career Assistant"}
          </h2>
        </div>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Bot className="h-10 w-10 mb-4 text-green-500" />
            <h3 className="text-xl font-medium mb-2">
              Welcome to AI Career Assistant
            </h3>
            <p className="text-gray-400 max-w-md">
              Ask me anything about resumes, cover letters, interview preparation, or general career advice.
            </p>
          </div>
        ) : (
          <div>
            {messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                isThinking={message.id?.startsWith('temp-ai')} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        isSending={isSending}
        isDisabled={!isAuthenticated}
      />
    </div>
  );
};

export default ChatInterface;
