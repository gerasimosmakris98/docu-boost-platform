
import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Loader2, PaperclipIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import FileUpload from "@/components/common/FileUpload";
import ChatAttachment from "./ChatAttachment";

interface ChatInputProps {
  onSendMessage: (message: string, attachments: string[]) => Promise<void>;
  isDisabled: boolean;
  isSending: boolean;
  // isModern prop removed
}

const ChatInput = ({ 
  onSendMessage, 
  isDisabled, 
  isSending
  // isModern prop removed from destructuring
}: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<{ url: string; type: string; name: string }[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) { // Removed isModern condition
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]); // Removed isModern from dependencies
  
  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;
    
    const messageText = input.trim();
    const attachmentUrls = attachments.map(a => a.url);
    
    setInput("");
    setAttachments([]);
    setShowAttachments(false);
    
    if (textareaRef.current) { // Removed isModern condition
      textareaRef.current.style.height = 'auto';
    }
    
    await onSendMessage(messageText, attachmentUrls);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
  };

  // Modern design (now the only design)
  return (
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
                className="h-6 w-6 ml-1 hover:bg-gray-700 rounded-full p-0" // Increased button size
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
              >
                <span className="sr-only">Remove</span>
                <X className="h-4 w-4" /> {/* Increased icon size */}
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2 bg-gray-800/30 rounded-lg border border-gray-700/50 focus-within:border-green-500/50">
        <Button
          variant="ghost"
          size="icon" // size="icon" usually implies h-10 w-10 by default for Button component
          className="rounded-full h-10 w-10 flex-shrink-0 text-gray-400 hover:text-gray-300" // Explicitly set h-10 w-10
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
          disabled={isDisabled || isSending}
          rows={1}
          aria-label="Type your message to AI Career Advisor" // Added aria-label
        />
        
        <Button
          size="icon" // Ensure it uses icon sizing which is h-10 w-10
          className={cn(
            "rounded-full h-10 w-10 flex-shrink-0 mr-1", // Explicitly set h-10 w-10
            input.trim() || attachments.length > 0 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-700 text-gray-400"
          )}
          disabled={(!input.trim() && attachments.length === 0) || isSending || isDisabled}
          onClick={handleSend}
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" /> {/* Icon size can be adjusted if needed */}
          ) : (
            <Send className="h-5 w-5" /> {/* Icon size can be adjusted if needed */}
          )}
          <span className="sr-only">Send</span>
        </Button>
      </div>
      
      <div className="text-xs text-center mt-2 text-gray-500">
        AI Career Advisor is designed to help with career guidance and may not be accurate. Verify important information.
      </div>
    </div>
  );
// Classic design removed
};

export default ChatInput;
