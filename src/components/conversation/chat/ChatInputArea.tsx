
import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, Paperclip, X, FileText, Image, Link, File } from "lucide-react";
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
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message]);
  
  const handleSubmit = () => {
    if ((!message.trim() && files.length === 0) || sending) return;
    
    onSubmit(message, files);
    setMessage("");
    setFiles([]);
    
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
    
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });
    
    const newFiles = [...files, ...validFiles].slice(0, 5);
    setFiles(newFiles);
    
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
      return <Image className="h-3 w-3 text-blue-400" />;
    }
    if (fileType === 'application/pdf') {
      return <FileText className="h-3 w-3 text-red-400" />;
    }
    if (fileType.includes('text') || fileType.includes('document')) {
      return <FileText className="h-3 w-3 text-green-400" />;
    }
    return <File className="h-3 w-3 text-gray-400" />;
  };
  
  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      return (
        <img 
          src={url} 
          alt={file.name}
          className="w-12 h-12 object-cover rounded border"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    }
    return null;
  };
  
  return (
    <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
      {files.length > 0 && (
        <div className="p-2 border-b border-gray-700">
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
                        <span className="text-xs text-gray-300 truncate max-w-[100px]">
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
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove file"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAuthenticated ? "Type your message..." : "Sign in to send messages"}
              className={cn(
                "min-h-[44px] max-h-[120px] pr-20 bg-gray-800/50 border-gray-700 resize-none overflow-hidden text-white placeholder-gray-400",
                "focus:border-green-500 focus:ring-green-500/20",
                "text-sm leading-5"
              )}
              disabled={!isAuthenticated || sending}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                type="button"
                className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={handleFileClick}
                disabled={!isAuthenticated || sending || files.length >= 5}
                title="Attach files"
              >
                <Paperclip className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                type="button"
                className="h-7 w-7 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleSubmit}
                disabled={!isAuthenticated || sending || (!message.trim() && files.length === 0)}
              >
                {sending ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <SendIcon className="h-3 w-3" />
                )}
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
        </div>
        
        {files.length > 0 && (
          <p className="mt-2 text-xs text-gray-400 text-center">
            {files.length} file{files.length !== 1 ? 's' : ''} attached • {5 - files.length} more allowed
          </p>
        )}
        
        <p className="mt-2 text-xs text-center text-gray-500">
          Press Enter to send, Shift+Enter for line break
        </p>
      </div>
    </div>
  );
};

export default ChatInputArea;
