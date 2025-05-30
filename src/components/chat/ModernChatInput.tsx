
import { useState, useRef, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Mic, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ModernChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ModernChatInput = ({ onSubmit, disabled, placeholder = "Type your message..." }: ModernChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    onSubmit(message);
    setMessage("");
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
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      toast.success(`${files.length} file(s) selected`);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
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

  // Auto-resize textarea
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
        {/* Suggestions */}
        {message.length === 0 && (
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
                className="px-3 py-1.5 text-sm text-white/70 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Input Container */}
        <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl">
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
                    ? "bg-red-500 hover:bg-red-600 animate-pulse"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
                disabled={!message.trim() || disabled}
                size="sm"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
      />
    </div>
  );
};

export default ModernChatInput;
