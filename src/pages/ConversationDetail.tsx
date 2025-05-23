
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ChatMessage from "@/components/conversation/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { conversationService, Message, Conversation } from "@/services/conversationService";
import { useAuth } from "@/contexts/auth/useAuth";
import ChatAttachments from "@/components/conversation/ChatAttachments";
import ConversationHeader from "@/components/conversation/ConversationHeader";
import MessagesList from "@/components/conversation/MessagesList";
import ChatInputForm from "@/components/conversation/ChatInputForm";

const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load conversation and messages
  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      const { conversation: loadedConversation, messages: loadedMessages } = 
        await conversationService.getConversation(conversationId);
      
      if (!loadedConversation) {
        toast.error("Conversation not found");
        navigate("/conversations");
        return;
      }
      
      setConversation(loadedConversation);
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  
  // Create or load conversation on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view conversations");
      navigate("/");
      return;
    }
    
    const initializeConversation = async () => {
      try {
        // If ID is provided, load that conversation
        if (id) {
          await loadConversation(id);
        } else {
          // If no ID, create a default conversation or load the most recent one
          const defaultConversation = await conversationService.createDefaultConversation();
          if (defaultConversation) {
            navigate(`/conversations/${defaultConversation.id}`);
          } else {
            toast.error("Failed to create a conversation");
            navigate("/conversations");
          }
        }
      } catch (error) {
        console.error("Error initializing conversation:", error);
        toast.error("Failed to initialize conversation");
      }
    };
    
    initializeConversation();
  }, [id, isAuthenticated, loadConversation, navigate]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle sending a new message - moved to ChatInputForm
  const handleSendMessage = async (newMessage: string, attachments: Array<{ url: string; type: string; name: string }>) => {
    if (!id || !newMessage.trim()) return;
    
    try {
      // Create an array of attachment URLs
      const attachmentUrls = attachments.map(a => a.url);
      
      // Add user message to the UI immediately for better UX
      const optimisticUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: id,
        role: 'user',
        content: newMessage,
        created_at: new Date().toISOString(),
        attachments: attachmentUrls
      };
      
      // Update UI with the new message
      setMessages(prev => [...prev, optimisticUserMessage]);
      
      // Show loading message for better UX
      const optimisticAIMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        conversation_id: id,
        role: 'assistant',
        content: "Thinking...",
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, optimisticAIMessage]);
      
      // Send the message to the backend
      const response = await conversationService.sendMessage(id, newMessage, attachmentUrls);
      
      // Update the UI with the real response, replacing the temporary AI message
      if (response) {
        setMessages(prev => prev.filter(msg => msg.id !== optimisticAIMessage.id));
        // Reload all messages to ensure consistency
        await loadConversation(id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };
  
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Conversation Header */}
        <ConversationHeader 
          conversation={conversation} 
          isLoading={isLoading}
          onRefresh={() => id && loadConversation(id)}
        />
        
        {/* Messages Area */}
        <MessagesList 
          messages={messages} 
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />
        
        {/* Input Area */}
        <ChatInputForm onSend={handleSendMessage} />
      </div>
    </DashboardLayout>
  );
};

export default ConversationDetail;
