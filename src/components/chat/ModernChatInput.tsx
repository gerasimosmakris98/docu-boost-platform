
import { useState, useRef, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Mic, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ActionButton from "@/components/ui/ActionButton";

interface ModernChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ModernChatInput = ({ onSubmit, disabled, placeholder = "Type your message..." }: ModernChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!message.trim() || disabled) return;
    onSubmit(message);
    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mx-4 mb-4"
    >
      <div className="flex items-end gap-3">
        {/* Input Area */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[60px] max-h-[120px] resize-none border-0 bg-transparent text-white placeholder:text-white/60",
              "focus:ring-0 focus:outline-none text-base leading-relaxed"
            )}
          />
          
          {/* Quick Actions */}
          <div className="absolute bottom-2 left-2 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Voice Button */}
        <motion.div
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={toggleRecording}
            className={cn(
              "h-12 w-12 rounded-full transition-all duration-300",
              isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            )}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Send Button */}
        <motion.div
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Suggestions */}
      <div className="mt-3 flex flex-wrap gap-2">
        {["Help with my resume", "Interview preparation", "Career advice"].map((suggestion) => (
          <motion.button
            key={suggestion}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMessage(suggestion)}
            className="px-3 py-1 text-sm text-white/70 bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ModernChatInput;
