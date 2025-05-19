import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bot, 
  User, 
  Loader2, 
  Send, 
  PaperclipIcon, 
  FilePlus,
  X,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import FileUpload from "@/components/common/FileUpload";

interface ModernChatInterfaceProps {
  conversationId?: string;
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
}

const ModernChatInterface = ({ 
  conversationId, 
  conversation, 
  messages: initialMessages, 
  isLoading 
}: ModernChatInterfaceProps) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<{ url: string; type: string; name: string }[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
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
        // If no AI response, remove the loading message and show a quota error message
        const errorAiMessage: Message = {
          id: `error-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: "I apologize, but I'm currently experiencing some technical difficulties. This might be due to high demand or system limitations. Please try again in a few moments.",
          created_at: new Date().toISOString()
        };
        
        setMessages(prev => 
          prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(errorAiMessage)
        );
        
        toast.error("AI service is currently unavailable", {
          description: "This might be due to usage limits. Please try again later."
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // If error occurs, remove loading message and add error message
      const errorAiMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: "I apologize, but I encountered an error while processing your request. Please try again later.",
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => 
        prev.filter(msg => msg.id !== optimisticAiMessage.id).concat(errorAiMessage)
      );
      
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
    
    if (isPdf || isUrl) {
      return (
        <a 
          key={index}
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs mt-1 p-2 bg-gray-800 rounded-md hover:bg-gray-700"
        >
          {isPdf ? <FilePlus className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />}
          <span className="truncate">{fileName}</span>
        </a>
      );
    }
    
    return null;
  };
  
  return (
    <div className="flex flex-col h-full bg-black">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Bot className="h-12 w-12 mb-4 text-green-500" />
            <h2 className="text-2xl font-semibold mb-3 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              AI Career Advisor
            </h2>
            <p className="text-gray-400 max-w-md">
              Your personal AI assistant for career guidance, resume building, interview preparation, and more.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isUserMessage = message.role === 'user';
            const isThinking = message.id?.startsWith('temp-ai');
            
            return (
              <div 
                key={message.id} 
                className={cn(
                  "flex gap-4 max-w-3xl mx-auto",
                  isUserMessage ? "flex-row" : "flex-row"
                )}
              >
                <Avatar className={cn(
                  "h-8 w-8 mt-1",
                  isUserMessage ? "bg-green-500/10 border border-green-500/20" : "bg-gray-700/50 border border-gray-600/30"
                )}>
                  {isUserMessage ? (
                    <>
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-white bg-green-700">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="" />
                      <AvatarFallback className="text-white bg-gray-700">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="font-medium text-sm">
                    {isUserMessage ? "You" : "AI Career Advisor"}
                  </div>
                  
                  <div className={cn(
                    "text-sm",
                    isThinking ? "text-gray-400" : "text-white"
                  )}>
                    {isThinking ? (
                      <div className="flex items-center">
                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <div>
                        {isUserMessage ? (
                          <>
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((url, index) => renderAttachment(url, index))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="prose prose-invert max-w-none prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/30">
        {showAttachments && (
          <div className="mb-4 p-3 bg-gray-800/80 rounded-lg">
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
                className="bg-gray-800/80 text-gray-200 text-xs rounded-full px-2 py-1 flex items-center gap-1"
              >
                <span className="truncate max-w-[150px]">{attachment.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1 hover:bg-gray-700 rounded-full p-0"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                >
                  <span className="sr-only">Remove</span>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2 bg-gray-800/30 rounded-lg border border-gray-700/50 focus-within:border-green-500/50">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 flex-shrink-0 text-gray-400 hover:text-gray-300"
            onClick={() => setShowAttachments(!showAttachments)}
            disabled={isSending}
          >
            <PaperclipIcon className="h-5 w-5" />
            <span className="sr-only">Add attachment</span>
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message AI Career Advisor..."
            className="min-h-[20px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 resize-none py-3 mt-0 overflow-hidden"
            onKeyDown={handleKeyDown}
            disabled={isSending || !isAuthenticated}
            rows={1}
          />
          
          <Button
            className={cn(
              "rounded-full h-8 w-8 flex-shrink-0 mr-1",
              input.trim() || attachments.length > 0 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-700 text-gray-400"
            )}
            disabled={(!input.trim() && attachments.length === 0) || isSending || !isAuthenticated}
            onClick={handleSendMessage}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
        
        <div className="text-xs text-center mt-2 text-gray-500">
          AI Career Advisor is designed to help with career guidance and may not be accurate. Verify important information.
        </div>
      </div>
    </div>
  );
};

export default ModernChatInterface;
