
import { useState, useRef, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Mic, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import FileUpload from "@/components/common/FileUpload";

interface ModernChatInputProps {
  onSubmit: (message: string, attachments?: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ModernChatInput = ({ onSubmit, disabled, placeholder = "Type your message..." }: ModernChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if ((!message.trim() && attachments.length === 0) || disabled) return;
    onSubmit(message, attachments);
    setMessage("");
    setAttachments([]);
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

  const handleFileUpload = () => {
    setShowFileUpload(!showFileUpload);
  };

  const handleFileUploaded = (url: string, fileName: string, fileType: string) => {
    setAttachments(prev => [...prev, url]);
    setShowFileUpload(false);
    toast.success(`${fileName} uploaded successfully`);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        Array.from(files).forEach(file => {
          const url = URL.createObjectURL(file);
          setAttachments(prev => [...prev, url]);
        });
        toast.success(`${files.length} image(s) selected`);
      }
    };
    input.click();
  };

  const handleEmojiPicker = () => {
    toast.info("Emoji picker coming soon!");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Voice recording started");
    } else {
      toast.info("Voice recording stopped");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const suggestions = [
    "Help me with my resume",
    "Prepare for an interview",
    "Career change advice",
    "Salary negotiation tips"
  ];

  return (
    <div className="sticky bottom-0 bg-transparent p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        {/* File Upload Component */}
        {showFileUpload && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <FileUpload onFileUploaded={handleFileUploaded} />
          </motion.div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex flex-wrap gap-2"
          >
            {attachments.map((url, index) => (
              <div key={index} className="relative bg-white/10 rounded-lg p-2 flex items-center gap-2">
                <span className="text-sm text-white/80 truncate max-w-32">
                  Attachment {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="h-6 w-6 p-0 text-white/60 hover:text-red-400"
                >
                  ×
                </Button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Suggestions */}
        {message.length === 0 && attachments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex flex-wrap gap-2 justify-center"
          >
            {suggestions.map((suggestion) => (
              <motion.button
                key={suggestion}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMessage(suggestion)}
                className="px-3 py-1.5 text-sm text-white/70 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Input Container */}
        <div className="relative bg-white/10 border border-white/20 rounded-2xl">
          <div className="flex items-end gap-3 p-4">
            {/* Input Area */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent text-white placeholder:text-white/60",
                  "focus:ring-0 focus:outline-none text-base leading-relaxed p-0"
                )}
                style={{ height: 'auto' }}
              />
              
              {/* Quick Actions */}
              <div className="absolute bottom-0 left-0 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFileUpload}
                  className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-white/10"
                  disabled={disabled}
                >
                  <Paperclip className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleImageUpload}
                  className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-white/10"
                  disabled={disabled}
                >
                  <Image className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEmojiPicker}
                  className="h-7 w-7 p-0 text-white/60 hover:text-white hover:bg-white/10"
                  disabled={disabled}
                >
                  <Smile className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Voice Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={toggleRecording}
                size="sm"
                className={cn(
                  "h-10 w-10 rounded-full transition-all duration-300",
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
                disabled={disabled}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </motion.div>

            {/* Send Button */}
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmit}
                disabled={(!message.trim() && attachments.length === 0) || disabled}
                size="sm"
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Helper Text */}
        <p className="text-center text-xs text-white/50 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </motion.div>
    </div>
  );
};

export default ModernChatInput;
