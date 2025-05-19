
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SendHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  conversationService, 
  Conversation, 
  Message,
  ConversationType
} from "@/services/conversationService";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ChatMessage from "./ChatMessage";

interface ConversationChatProps {
  conversationId: string;
}

const ConversationChat = ({ conversationId }: ConversationChatProps) => {
  const { isAuthenticated } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && conversationId) {
      fetchConversation();
    }
  }, [conversationId, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const data = await conversationService.getConversation(conversationId);
      
      if (data.conversation) {
        setConversation(data.conversation);
        setMessages(data.messages);
        
        // If no messages yet, add a welcome message based on conversation type
        if (data.messages.length === 0 && data.conversation.type) {
          const welcomeMessage = getWelcomeMessage(data.conversation.type as ConversationType);
          setMessages([
            {
              conversation_id: conversationId,
              role: 'assistant',
              content: welcomeMessage,
              created_at: new Date().toISOString()
            }
          ]);
        }
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to send messages");
      return;
    }
    
    const userMessage = input.trim();
    setInput("");
    
    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    
    // Add temporary loading message
    const tempLoadingId = Date.now().toString();
    const tempLoadingMessage: Message = {
      id: tempLoadingId,
      conversation_id: conversationId,
      role: 'assistant',
      content: '...',
      created_at: new Date().toISOString()
    };
    
    setSending(true);
    setMessages(prev => [...prev, tempLoadingMessage]);
    
    try {
      const response = await conversationService.sendMessage(conversationId, userMessage);
      
      // Remove temporary loading message and add real response
      if (response.aiResponse) {
        setMessages(prev => 
          prev.filter(msg => msg.id !== tempLoadingId).concat(response.aiResponse!)
        );
      } else {
        // If response failed, remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== tempLoadingId));
        toast.error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove loading message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempLoadingId));
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getConversationTitle = () => {
    if (loading) return "Loading...";
    if (!conversation) return "Chat";
    return conversation.title;
  };

  const getWelcomeMessage = (type: ConversationType): string => {
    switch (type) {
      case 'resume':
        return "Welcome to the Resume Builder! I'm here to help you create a professional, effective resume. To get started, you can:\n\n• Tell me about your work experience\n• Upload an existing resume for me to improve\n• Share a job description to target your resume\n• Ask for specific resume advice\n\nHow would you like to begin?";
      case 'cover_letter':
        return "Welcome to the Cover Letter Assistant! I'll help you craft a compelling cover letter that stands out. To get started, you can:\n\n• Share the job posting you're applying for\n• Tell me about your key qualifications\n• Ask for help with specific sections\n• Get feedback on an existing cover letter\n\nWhat would you like help with today?";
      case 'interview_prep':
        return "Welcome to Interview Preparation! I'll help you prepare for your upcoming interviews. To get started, you can:\n\n• Tell me what position you're interviewing for\n• Practice answering common interview questions\n• Get feedback on your responses\n• Ask for tips on specific interview scenarios\n\nHow would you like to begin your preparation?";
      default:
        return "Hello! I'm your career AI assistant. I can help with resumes, cover letters, interview preparation, and general career advice. What would you like assistance with today?";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>{getConversationTitle()}</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage 
                  key={message.id || index}
                  message={message}
                  isLoading={message.id === undefined}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            placeholder="Type your message here..."
            className="min-h-[80px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending || !isAuthenticated}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || sending || !isAuthenticated}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ConversationChat;
