
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
import { uploadFile } from "@/services/api/fileUploadService";

interface ConversationChatProps {
  conversationId: string;
}

const ConversationChat = ({ conversationId }: ConversationChatProps) => {
  const { isAuthenticated, user } = useAuth();
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

  const handleSubmit = async (userMessage: string, files: File[] = []) => {
    if (!userMessage.trim() && files.length === 0) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to send messages");
      return;
    }
    
    // Handle file uploads if any
    let attachments: { url: string; type: string; name: string }[] = [];
    
    if (files.length > 0) {
      try {
        setSending(true);
        // Show uploading state - Using 'assistant' role instead of 'system'
        const tempLoadingId = `temp-upload-${Date.now()}`;
        const tempLoadingMessage: Message = {
          id: tempLoadingId,
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Uploading file(s)...',
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, tempLoadingMessage]);
        
        // Upload files and collect URLs
        for (const file of files) {
          const fileExt = file.name.split('.').pop() || '';
          const filePath = `uploads/${user?.id}/${Date.now()}-${file.name}`;
          const fileUrl = await uploadFile(file, filePath);
          
          if (fileUrl) {
            attachments.push({
              url: fileUrl,
              type: file.type,
              name: file.name
            });
          }
        }
        
        // Remove uploading message
        setMessages(prev => prev.filter(msg => msg.id !== tempLoadingId));
        
        if (attachments.length === 0 && files.length > 0) {
          toast.error("Failed to upload files");
          setSending(false);
          return;
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        toast.error("Failed to upload files");
        setSending(false);
        return;
      }
    }
    
    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
      attachments: attachments.map(a => a.url)
    };
    
    setMessages(prev => [...prev, tempUserMessage]);
    
    // Add temporary loading message
    const tempLoadingId = `temp-loading-${Date.now()}`;
    const tempLoadingMessage: Message = {
      id: tempLoadingId,
      conversation_id: conversationId,
      role: 'assistant', // Changed from 'system' to 'assistant'
      content: '...',
      created_at: new Date().toISOString()
    };
    
    setSending(true);
    setMessages(prev => [...prev, tempLoadingMessage]);
    
    try {
      // Convert attachments to URLs for the API
      const attachmentUrls = attachments.map(a => a.url);
      
      const response = await conversationService.sendMessage(conversationId, userMessage, attachmentUrls);
      
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
        return "Welcome to the Resume Builder! I'm here to help you create a professional, effective resume. I've noticed you have some profile data already, which I'll use to provide personalized guidance. To get started, you can:\n\n• Tell me about your work experience\n• Upload an existing resume for me to improve\n• Share a job description to target your resume\n• Ask for specific resume advice\n\nHow would you like to begin?";
      case 'cover_letter':
        return "Welcome to the Cover Letter Assistant! I'll help you craft a compelling cover letter that stands out. Based on your profile information, I can provide tailored guidance. To get started, you can:\n\n• Share the job posting you're applying for\n• Tell me about your key qualifications\n• Ask for help with specific sections\n• Get feedback on an existing cover letter\n\nWhat would you like help with today?";
      case 'interview_prep':
        return "Welcome to Interview Preparation! Looking at your profile, I'll help you prepare for interviews with personalized guidance. To get started, you can:\n\n• Tell me what position you're interviewing for\n• Practice answering common interview questions\n• Get feedback on your responses\n• Ask for tips on specific interview scenarios\n\nHow would you like to begin your preparation?";
      case 'linkedin':
        return "Welcome to LinkedIn Profile Optimization! I'll help you enhance your LinkedIn presence based on your current profile data. To get started, you can:\n\n• Ask for feedback on specific sections of your profile\n• Explore strategies to increase your visibility to recruiters\n• Learn how to build your professional network\n• Upload your current LinkedIn profile for a comprehensive review\n\nHow would you like to improve your LinkedIn presence?";
      case 'job_search':
        return "Welcome to Job Search Strategy! Based on your profile information, I'll help you navigate your job search effectively. To get started, you can:\n\n• Tell me about your target roles or industries\n• Ask for help finding job opportunities that match your skills\n• Learn strategies for networking and outreach\n• Get advice on application tracking and follow-up\n\nWhat aspect of your job search would you like to focus on?";
      case 'assessment':
        return "Welcome to Assessment Preparation! I'll help you prepare for assessments and tests with personalized guidance based on your profile. To get started, you can:\n\n• Tell me about the assessment you're preparing for\n• Practice with sample questions\n• Learn strategies for different types of tests\n• Get tailored advice for technical or behavioral assessments\n\nWhat type of assessment are you preparing for?";
      default:
        return "Hello! I'm your personalized career AI assistant. I've reviewed your profile information and can help with resumes, cover letters, interview preparation, and general career advice tailored to your background. What would you like assistance with today?";
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
