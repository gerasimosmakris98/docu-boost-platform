
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ChatMessage from "@/components/conversation/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { conversationService, Message, Conversation } from "@/services/conversationService";
import { useAuth } from "@/contexts/AuthContext";
import ChatAttachments from "@/components/conversation/ChatAttachments";

const ConversationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<Array<{ url: string; type: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to load conversation and messages
  const loadConversation = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const { conversation: loadedConversation, messages: loadedMessages } = 
        await conversationService.getConversation(id);
      
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
  };
  
  // Load conversation on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please sign in to view conversations");
      navigate("/");
      return;
    }
    
    loadConversation();
  }, [id, isAuthenticated, navigate]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!id || !newMessage.trim()) return;
    
    try {
      setIsSending(true);
      
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
      
      // Clear input fields
      setNewMessage("");
      setAttachments([]);
      
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
        // Append real AI response
        await loadConversation(); // Reload all messages to ensure consistency
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle attachments
  const handleAttach = (newAttachments: Array<{ url: string; type: string; name: string }>) => {
    setAttachments(newAttachments);
    toast.success(`${newAttachments.length} attachment(s) added`);
  };
  
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Conversation Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{conversation?.title || "Conversation"}</h1>
              <p className="text-sm text-gray-500">
                {conversation?.type === 'resume_feedback' ? 'Resume Review Assistant' :
                 conversation?.type === 'interview_prep' ? 'Interview Preparation Coach' :
                 conversation?.type === 'cover_letter' ? 'Cover Letter Assistant' :
                 conversation?.type === 'job_search' ? 'Job Search Strategist' :
                 'AI Career Assistant'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={loadConversation}
              disabled={isLoading}
            >
              <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground">No messages yet.</p>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending a message below.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                sender={message.role}
                content={message.content}
                timestamp={new Date(message.created_at).toLocaleTimeString()}
                attachments={message.attachments}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t p-4">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div 
                  key={index}
                  className="bg-blue-50 text-blue-600 text-xs rounded-full px-2 py-1 flex items-center gap-1"
                >
                  <Paperclip className="h-3 w-3" />
                  <span className="truncate max-w-[150px]">{attachment.name}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <ChatAttachments onAttach={handleAttach} />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ConversationDetail;
