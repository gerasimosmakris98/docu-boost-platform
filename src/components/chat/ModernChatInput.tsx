
import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ModernChatInputProps {
  onSubmit: (message: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ModernChatInput = ({ onSubmit, disabled, placeholder = "Type your message..." }: ModernChatInputProps) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((!message.trim() && files.length === 0) || disabled) return;
    onSubmit(message, files);
    setMessage("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const canSend = (message.trim().length > 0 || files.length > 0) && !disabled;

  return (
    <div className="border-t border-white/20 bg-transparent p-4 w-full">
      <div className="max-w-4xl mx-auto w-full">
        {/* File Attachments Preview */}
        {files.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/20">
                <span className="text-sm text-white/80 truncate max-w-32">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-5 w-5 p-0 text-white/60 hover:text-red-400 min-h-[44px] min-w-[44px]"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input Container - Proper responsive design */}
        <div className="relative border border-white/20 rounded-2xl bg-white/5 w-full">
          <div className="flex items-end gap-3 p-4 w-full">
            {/* File Upload Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 w-11 p-0 text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0 min-h-[44px] min-w-[44px]"
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Text Input */}
            <div className="flex-1 relative min-w-0">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent text-white placeholder:text-white/60",
                  "focus:ring-0 focus:outline-none text-base leading-relaxed p-0 w-full"
                )}
                style={{ height: 'auto', fontSize: '16px' }}
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSubmit}
              disabled={!canSend}
              size="sm"
              className="h-11 w-11 p-0 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 min-h-[44px] min-w-[44px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-xs text-white/50 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt"
        disabled={disabled}
      />
    </div>
  );
};

export default ModernChatInput;
