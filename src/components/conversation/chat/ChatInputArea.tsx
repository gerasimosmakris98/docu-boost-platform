
import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, Paperclip, X, Link, FileType } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ChatInputAreaProps {
  onSubmit: (message: string, files?: File[]) => void;
  sending: boolean;
  isAuthenticated: boolean;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ 
  onSubmit, 
  sending, 
  isAuthenticated 
}) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  // Auto resize textarea as content changes
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [message]);
  
  const handleSubmit = () => {
    if ((!message.trim() && files.length === 0) || sending) return;
    
    onSubmit(message, files);
    setMessage("");
    setFiles([]);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Check file sizes (limit to 5MB each)
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });
    
    // Add to existing files (limit to 3 files total)
    const newFiles = [...files, ...validFiles].slice(0, 3);
    
    setFiles(newFiles);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const getFileIcon = (file: File) => {
    const fileType = file.type;
    if (fileType.startsWith('image/')) {
      return <FileType className="h-3 w-3" />;
    }
    return <FileType className="h-3 w-3" />;
  };
  
  return (
    <div className="p-4 border-t border-gray-800 bg-gray-900/50">
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="bg-gray-800 text-gray-300 text-sm px-2 py-1 rounded-full flex items-center"
            >
              {getFileIcon(file)}
              <span className="truncate max-w-[150px] ml-1">{file.name}</span>
              <button 
                onClick={() => removeFile(index)}
                className="ml-1 hover:text-red-400"
                aria-label="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className={cn(
        "flex items-end gap-2",
        isMobile && "flex-col"
      )}>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAuthenticated ? "Type your message..." : "Sign in to send messages"}
            className="min-h-[60px] max-h-[200px] pr-10 bg-gray-800/50 border-gray-700 resize-none overflow-hidden"
            disabled={!isAuthenticated || sending}
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              type="button"
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={handleFileClick}
              disabled={!isAuthenticated || sending || files.length >= 3}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
            disabled={!isAuthenticated || sending}
          />
        </div>
        <Button
          size="icon"
          type="button"
          className={cn(
            "h-10 w-10 rounded-full",
            isMobile && "w-full",
            (sending || (!message.trim() && files.length === 0)) && "opacity-50"
          )}
          onClick={handleSubmit}
          disabled={!isAuthenticated || sending || (!message.trim() && files.length === 0)}
        >
          {isMobile ? (
            <div className="flex items-center justify-center w-full">
              <SendIcon className="h-4 w-4 mr-2" />
              <span>Send</span>
            </div>
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
      {files.length > 0 && (
        <p className="mt-1 text-xs text-gray-400">
          {files.length} file{files.length !== 1 ? 's' : ''} attached ({3 - files.length} more allowed)
        </p>
      )}
      <p className="mt-2 text-xs text-center text-gray-500">
        AI Career Advisor provides guidance, not legal or professional advice. Always verify important information.
      </p>
    </div>
  );
};

export default ChatInputArea;
