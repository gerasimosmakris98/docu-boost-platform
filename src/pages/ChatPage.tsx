
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, Send, FileText, Image, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Conversation, Message, conversationService } from '@/services/conversationService';
import ChatMessage from '@/components/conversation/ChatMessage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ChatPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const fetchConversation = async () => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const data = await conversationService.getConversation(conversationId);
      
      if (data.conversation) {
        setConversation(data.conversation);
        setMessages(data.messages);
      } else {
        toast.error("Conversation not found");
        navigate('/chat');
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (!conversationId || !input.trim()) return;
    
    try {
      setSending(true);
      
      // Optimistically add user message to UI
      const tempUserMessage: Message = {
        id: `temp-user-${Date.now()}`,
        conversation_id: conversationId,
        role: 'user',
        content: input.trim(),
        created_at: new Date().toISOString(),
        attachments
      };
      
      setMessages(prev => [...prev, tempUserMessage]);
      setInput('');
      setAttachments([]);
      
      // Add temporary loading message
      const tempLoadingId = `temp-loading-${Date.now()}`;
      const tempLoadingMessage: Message = {
        id: tempLoadingId,
        conversation_id: conversationId,
        role: 'assistant',
        content: '...',
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempLoadingMessage]);
      
      // Send the message to the server
      const response = await conversationService.sendMessage(conversationId, input.trim(), attachments);
      
      // Remove temporary loading message and add real response
      if (response && response.aiResponse) {
        setMessages(prev => 
          prev.filter(msg => msg.id !== tempLoadingId).concat(response.aiResponse)
        );
      } else {
        // If response failed, remove loading message
        setMessages(prev => prev.filter(msg => msg.id !== tempLoadingId));
        toast.error("Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      
      // Focus the textarea after sending
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleFileUpload = (type: 'document' | 'image' | 'link') => {
    switch (type) {
      case 'document':
        toast.info("Document upload coming soon");
        break;
      case 'image':
        toast.info("Image upload coming soon");
        break;
      case 'link':
        const url = prompt("Enter the URL to analyze:");
        if (url) {
          setAttachments(prev => [...prev, url]);
          toast.success("URL added for analysis");
        }
        break;
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full" />
      </div>
    );
  }
  
  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Conversation Not Found</h2>
          <p className="text-muted-foreground mt-2">The conversation you're looking for doesn't exist or has been deleted.</p>
          <Button className="mt-4" onClick={() => navigate('/chat')}>
            Start New Conversation
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold">{conversation.title}</h2>
            <p className="text-muted-foreground mt-2">
              Start the conversation by sending a message below.
            </p>
          </div>
        ) : (
          <div className="space-y-6 pb-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLoading={message.id.startsWith('temp-loading')}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="border-t p-4">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((url, index) => (
              <div 
                key={index}
                className="bg-primary/10 text-xs rounded-full px-2 py-1 flex items-center gap-1"
              >
                <LinkIcon className="h-3 w-3" />
                <span className="truncate max-w-[200px]">{url}</span>
                <button 
                  className="ml-1 hover:text-destructive"
                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleFileUpload('document')}>
                <FileText className="mr-2 h-4 w-4" />
                Attach Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileUpload('image')}>
                <Image className="mr-2 h-4 w-4" />
                Attach Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileUpload('link')}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Analyze URL
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] flex-1 resize-none"
            disabled={sending}
          />
          
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || sending}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground text-center">
          {sending ? 'AI is thinking...' : 'Press Enter to send, Shift+Enter for new line'}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
