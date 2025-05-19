
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  conversationService, 
  Conversation, 
  Message,
  ConversationType
} from "@/services/conversationService";
import { useAuth } from "@/contexts/AuthContext";
import ChatConversationHeader from "./chat/ChatConversationHeader";
import ChatMessagesList from "./chat/ChatMessagesList";
import ChatInputArea from "./chat/ChatInputArea";
import { toast } from "sonner";

interface ConversationChatProps {
  conversationId: string;
}

const ConversationChat = ({ conversationId }: ConversationChatProps) => {
  const { isAuthenticated } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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
              id: `welcome-${Date.now()}`,
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

  const handleSubmit = async (userMessage: string, attachments: Array<{ url: string; type: string; name: string }> = []) => {
    if (!userMessage.trim()) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to send messages");
      return;
    }
    
    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    
    // Add temporary loading message
    const tempLoadingId = `temp-loading-${Date.now()}`;
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
      if (response && response.aiResponse) {
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

  const handleFileAnalysis = (analysis: string) => {
    // Add file analysis as a message pair
    const userMessage: Message = {
      id: `file-upload-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: 'I uploaded a file for analysis.',
      created_at: new Date().toISOString()
    };
    
    const aiResponse: Message = {
      id: `file-analysis-${Date.now()}`,
      conversation_id: conversationId,
      role: 'assistant',
      content: analysis,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage, aiResponse]);
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
        <ChatConversationHeader 
          conversation={conversation} 
          loading={loading}
          onAnalyzerOpen={() => {}}
          onFileAnalysis={handleFileAnalysis}
        />
        
        <CardContent className="flex-1 overflow-y-auto pb-4">
          <ChatMessagesList 
            messages={messages} 
            loading={loading} 
            messagesEndRef={messagesEndRef} 
          />
        </CardContent>
      </Card>
      
      <ChatInputArea 
        onSubmit={handleSubmit} 
        sending={sending} 
        isAuthenticated={isAuthenticated} 
      />
    </div>
  );
};

export default ConversationChat;
