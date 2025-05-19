
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, Loader2 } from "lucide-react";
import ChatAttachments from "@/components/conversation/ChatAttachments";

interface ChatInputAreaProps {
  onSubmit: (message: string, attachments?: Array<{ url: string; type: string; name: string }>) => Promise<void>;
  sending: boolean;
  isAuthenticated: boolean;
}

const ChatInputArea = ({ onSubmit, sending, isAuthenticated }: ChatInputAreaProps) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Array<{ url: string; type: string; name: string }>>([]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !isAuthenticated) return;
    
    try {
      await onSubmit(input, attachments);
      setInput("");
      setAttachments([]);
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };
  
  const handleAttachments = (newAttachments: Array<{ url: string; type: string; name: string }>) => {
    setAttachments(newAttachments);
  };
  
  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 flex flex-col">
          <Textarea
            placeholder="Type your message here..."
            className="min-h-[80px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending || !isAuthenticated}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!sending && input.trim() && isAuthenticated) {
                  handleSubmit(e);
                }
              }
            }}
          />
          <div className="flex justify-start mt-1">
            <ChatAttachments onAttach={handleAttachments} />
          </div>
        </div>
        <Button type="submit" size="icon" disabled={!input.trim() || sending || !isAuthenticated}>
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatInputArea;
