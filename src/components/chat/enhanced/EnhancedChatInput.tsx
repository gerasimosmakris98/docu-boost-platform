
import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, X, Sparkles, Mic, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedChatInputProps {
  onSubmit: (message: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

const EnhancedChatInput = ({ 
  onSubmit, 
  disabled, 
  placeholder = "Ask me about your career...",
  isLoading = false
}: EnhancedChatInputProps) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((!message.trim() && files.length === 0) || disabled || isLoading) return;
    
    onSubmit(message, files);
    setMessage("");
    setFiles([]);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
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

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Voice recording started (demo)", { duration: 2000 });
      // Simulate recording for demo
      setTimeout(() => {
        setIsRecording(false);
        toast.success("Voice recording saved", { duration: 2000 });
      }, 3000);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-3 w-3" />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="h-3 w-3" />;
    return <Paperclip className="h-3 w-3" />;
  };

  const canSend = (message.trim().length > 0 || files.length > 0) && !disabled && !isLoading;

  return (
    <motion.div 
      className="border-t border-white/20 bg-transparent p-4 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto w-full">
        {/* Enhanced File Attachments Preview */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              className="mb-4 flex flex-wrap gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {files.map((file, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-2 bg-white/10 rounded-xl p-3 border border-white/20 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="text-blue-400">
                    {getFileIcon(file)}
                  </div>
                  <span className="text-sm text-white/80 truncate max-w-32">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all min-h-[24px] min-w-[24px]"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Input Container */}
        <motion.div 
          className={cn(
            "relative border-2 rounded-2xl bg-white/5 backdrop-blur-sm transition-all duration-300 w-full",
            isFocused 
              ? "border-blue-400/50 shadow-lg shadow-blue-500/20" 
              : "border-white/20 hover:border-white/30"
          )}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-end gap-3 p-4 w-full">
            {/* Enhanced File Upload Button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 w-11 p-0 text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0 min-h-[44px] min-w-[44px] rounded-full transition-all"
                disabled={disabled}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Voice Recording Button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceRecord}
                className={cn(
                  "h-11 w-11 p-0 flex-shrink-0 min-h-[44px] min-w-[44px] rounded-full transition-all",
                  isRecording 
                    ? "text-red-400 bg-red-500/20 hover:bg-red-500/30" 
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                disabled={disabled}
              >
                <motion.div
                  animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Mic className="h-4 w-4" />
                </motion.div>
              </Button>
            </motion.div>

            {/* Enhanced Text Input */}
            <div className="flex-1 relative min-w-0">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled || isLoading}
                className={cn(
                  "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent text-white placeholder:text-white/60",
                  "focus:ring-0 focus:outline-none text-base leading-relaxed p-0 w-full",
                  "disabled:opacity-50 transition-opacity duration-200"
                )}
                style={{ height: 'auto', fontSize: '16px' }}
              />
              
              {/* Character counter for long messages */}
              <AnimatePresence>
                {message.length > 800 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -bottom-6 right-0 text-xs text-white/50"
                  >
                    {message.length}/1000
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Send Button */}
            <motion.div 
              whileHover={{ scale: canSend ? 1.05 : 1 }} 
              whileTap={{ scale: canSend ? 0.95 : 1 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={!canSend}
                size="sm"
                className={cn(
                  "h-11 w-11 p-0 rounded-full flex-shrink-0 min-h-[44px] min-w-[44px] transition-all duration-200",
                  canSend
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-xl"
                    : "bg-gray-600 opacity-50 cursor-not-allowed"
                )}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 180 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0, rotate: -180 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 180 }}
                    >
                      <Send className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Helper Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-3 space-y-1"
        >
          <p className="text-xs text-white/50">
            Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Enter</kbd> to send, 
            <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs ml-1">Shift</kbd> + 
            <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">Enter</kbd> for new line
          </p>
          {files.length > 0 && (
            <motion.p 
              className="text-xs text-blue-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {files.length} file{files.length > 1 ? 's' : ''} attached
            </motion.p>
          )}
        </motion.div>
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
    </motion.div>
  );
};

export default EnhancedChatInput;
