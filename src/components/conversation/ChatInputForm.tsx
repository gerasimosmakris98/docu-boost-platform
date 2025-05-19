
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import ChatAttachments from "@/components/conversation/ChatAttachments";

interface ChatInputFormProps {
  onSend: (message: string, attachments: Array<{ url: string; type: string; name: string }>) => Promise<void>;
}

const ChatInputForm = ({ onSend }: ChatInputFormProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<Array<{ url: string; type: string; name: string }>>([]);
  const [isSending, setIsSending] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    try {
      await onSend(newMessage, attachments);
      // Clear input fields on success
      setNewMessage("");
      setAttachments([]);
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle attachments
  const handleAttach = (newAttachments: Array<{ url: string; type: string; name: string }>) => {
    setAttachments(newAttachments);
  };
  
  return (
    <div className="border-t p-4">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div 
              key={index}
              className="bg-blue-50 text-blue-600 text-xs rounded-full px-2 py-1 flex items-center gap-1"
            >
              <span className="truncate max-w-[150px]">{attachment.name}</span>
              <button 
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                className="ml-1 text-blue-700 hover:text-blue-900"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 resize-none"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!isSending && newMessage.trim()) {
                handleSubmit(e);
              }
            }
          }}
        />
        <div className="flex flex-col gap-2">
          <ChatAttachments onAttach={handleAttach} />
          <Button 
            type="submit"
            disabled={!newMessage.trim() || isSending}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInputForm;
