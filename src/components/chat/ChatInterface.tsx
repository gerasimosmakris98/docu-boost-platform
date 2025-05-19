
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Paperclip, 
  Bot, 
  User as UserIcon, 
  Loader2,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import FileUpload from "@/components/common/FileUpload";

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
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<{ url: string; type: string; name: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim() && attachments.length === 0) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to send messages");
      navigate("/auth");
      return;
    }
    if (!conversationId) {
      toast.error("Invalid conversation");
      return;
    }
    
    const messageText = input.trim();
    setInput("");
    
    // Create attachment URLs array
    const attachmentUrls = attachments.map(a => a.url);
    setAttachments([]);
    setShowAttachments(false);
    
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
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileUploaded = (url: string, fileName: string) => {
    // Determine file type
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    let type = 'document';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
      type = 'image';
    } else if (['pdf'].includes(fileExtension)) {
      type = 'pdf';
    }
    
    setAttachments(prev => [...prev, { url, type, name: fileName }]);
    toast.success(`${fileName} attached`);
  };
  
  const renderAttachment = (url: string, index: number) => {
    const fileExtension = url.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const isPdf = fileExtension === 'pdf';
    const isUrl = url.startsWith('http') && !isImage && !isPdf;
    
    // Get filename from URL
    const fileName = url.split('/').pop() || url;
    
    if (isImage) {
      return (
        <div key={index} className="mt-2">
          <img 
            src={url} 
            alt="Attachment" 
            className="max-w-xs rounded-md border border-gray-800"
          />
        </div>
      );
    }
    
    if (isPdf) {
      return (
        <a 
          key={index}
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs mt-1 p-2 bg-gray-800 rounded-md hover:bg-gray-700"
        >
          <FileText className="h-4 w-4" />
          <span className="truncate">{fileName}</span>
        </a>
      );
    }
    
    return (
      <a 
        key={index}
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs mt-1 text-blue-400 hover:text-blue-300"
      >
        <LinkIcon className="h-3 w-3" />
        <span className="truncate">{url}</span>
      </a>
    );
  };
  
  const renderMessage = (message: Message) => {
    const isUserMessage = message.role === 'user';
    
    return (
      <div 
        key={message.id} 
        className={cn(
          "py-4 px-4 md:px-6 flex gap-4",
          isUserMessage ? "bg-gray-900" : "bg-gray-950"
        )}
      >
        <Avatar className="h-8 w-8">
          {isUserMessage ? (
            <>
              <AvatarImage src="" />
              <AvatarFallback className="bg-green-700 text-white">
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage src="" />
              <AvatarFallback className="bg-gray-700 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </>
          )}
        </Avatar>
        
        <div className="flex flex-col flex-1 gap-1 min-w-0">
          <div className="text-sm font-medium text-gray-300">
            {isUserMessage ? "You" : "AI Assistant"}
          </div>
          
          <div className="text-sm text-gray-100">
            {message.id?.startsWith('temp-ai') ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>AI is thinking...</span>
              </div>
            ) : isUserMessage ? (
              <>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((url, index) => renderAttachment(url, index))}
                  </div>
                )}
              </>
            ) : (
              <div className="prose prose-invert max-w-none text-gray-100">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        {showAttachments && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Add attachment</h3>
            <FileUpload 
              onFileUploaded={handleFileUploaded} 
              maxSizeMB={5}
            />
            <div className="flex justify-end mt-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowAttachments(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
        
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div 
                key={index}
                className="bg-gray-800 text-gray-200 text-xs rounded-full px-2 py-1 flex items-center gap-1"
              >
                {attachment.type === 'image' ? (
                  <ImageIcon className="h-3 w-3" />
                ) : attachment.type === 'pdf' ? (
                  <FileText className="h-3 w-3" />
                ) : (
                  <Paperclip className="h-3 w-3" />
                )}
                <span className="truncate max-w-[150px]">{attachment.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1 hover:bg-gray-700 rounded-full p-0"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                >
                  <span className="sr-only">Remove</span>
                  <span>×</span>
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 flex-shrink-0"
            onClick={() => setShowAttachments(!showAttachments)}
            disabled={isSending}
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Add attachment</span>
          </Button>
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message AI Assistant..."
            className="min-h-[80px] bg-gray-800 border-gray-700 resize-none"
            onKeyDown={handleKeyDown}
            disabled={isSending || !isAuthenticated}
          />
          
          <Button
            className="rounded-full h-10 w-10 flex-shrink-0 bg-green-600 hover:bg-green-700"
            disabled={(!input.trim() && attachments.length === 0) || isSending || !isAuthenticated}
            onClick={handleSendMessage}
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
