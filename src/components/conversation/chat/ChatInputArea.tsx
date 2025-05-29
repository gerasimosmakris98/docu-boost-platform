
import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, Paperclip, X, FileType, Image, Link } from "lucide-react";
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
    
    // Check file sizes (limit to 10MB each)
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });
    
    // Add to existing files (limit to 5 files total)
    const newFiles = [...files, ...validFiles].slice(0, 5);
    
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
      return <Image className="h-4 w-4 text-blue-400" />;
    }
    if (fileType === 'application/pdf') {
      return <FileType className="h-4 w-4 text-red-400" />;
    }
    if (fileType.includes('text') || fileType.includes('document')) {
      return <FileType className="h-4 w-4 text-green-400" />;
    }
    return <FileType className="h-4 w-4 text-gray-400" />;
  };
  
  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      return (
        <img 
          src={url} 
          alt={file.name}
          className="w-16 h-16 object-cover rounded border"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    }
    return null;
  };
  
  return (
    <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      {files.length > 0 && (
        <div className="p-3 border-b border-gray-700">
          <div className="flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="relative bg-gray-800 rounded-lg p-2 border border-gray-700 group"
              >
                <div className="flex items-center gap-2">
                  {getFilePreview(file) || (
                    <div className="flex items-center gap-2">
                      {getFileIcon(file)}
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-300 truncate max-w-[120px]">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </span>
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={() => removeFile(index)}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove file"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-3 sm:p-4">
        <div className={cn(
          "flex items-end gap-2",
          isMobile && "flex-col space-y-2"
        )}>
          <div className="flex-1 relative w-full">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAuthenticated ? "Type your message..." : "Sign in to send messages"}
              className={cn(
                "min-h-[50px] max-h-[200px] pr-12 bg-gray-800/50 border-gray-700 resize-none overflow-hidden text-white placeholder-gray-400",
                "focus:border-green-500 focus:ring-green-500/20",
                isMobile && "text-base" // Prevent zoom on iOS
              )}
              disabled={!isAuthenticated || sending}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                type="button"
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={handleFileClick}
                disabled={!isAuthenticated || sending || files.length >= 5}
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
              multiple
              disabled={!isAuthenticated || sending}
            />
          </div>
          
          <Button
            size={isMobile ? "default" : "icon"}
            type="button"
            className={cn(
              "bg-green-600 hover:bg-green-700 text-white transition-all",
              isMobile ? "w-full py-3" : "h-12 w-12 rounded-full",
              (sending || (!message.trim() && files.length === 0)) && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleSubmit}
            disabled={!isAuthenticated || sending || (!message.trim() && files.length === 0)}
          >
            {sending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isMobile && <span>Sending...</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SendIcon className="h-4 w-4" />
                {isMobile && <span>Send</span>}
              </div>
            )}
          </Button>
        </div>
        
        {files.length > 0 && (
          <p className="mt-2 text-xs text-gray-400 text-center">
            {files.length} file{files.length !== 1 ? 's' : ''} attached • {5 - files.length} more allowed
          </p>
        )}
        
        <p className="mt-3 text-xs text-center text-gray-500">
          {isMobile ? "Tap" : "Press"} {isMobile ? "Send" : "Enter"} to send, {isMobile ? "new line for" : "Shift+Enter for"} line break
        </p>
      </div>
    </div>
  );
};

export default ChatInputArea;
