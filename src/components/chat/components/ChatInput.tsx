
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Image, 
  FileText,
  Smile,
  MoreHorizontal 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/services/api/fileUploadService";
import { useAuth } from "@/contexts/auth/useAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ChatInputProps {
  onSendMessage: (message: string, attachments: string[]) => void;
  isDisabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
}

const ChatInput = ({ 
  onSendMessage, 
  isDisabled = false, 
  isSending = false,
  placeholder = "Type your message..."
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;
    if (isDisabled || isSending) return;

    const messageToSend = message.trim();
    const attachmentsToSend = [...attachments];
    
    setMessage("");
    setAttachments([]);
    
    onSendMessage(messageToSend, attachmentsToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!user) return;

    const fileArray = Array.from(files);
    const uploadPromises = fileArray.map(async (file) => {
      const fileName = `${Date.now()}-${file.name}`;
      setUploadingFiles(prev => [...prev, fileName]);
      
      try {
        const filePath = `uploads/${user.id}/${fileName}`;
        const fileUrl = await uploadFile(file, filePath);
        
        if (fileUrl) {
          setAttachments(prev => [...prev, fileUrl]);
          toast.success(`${file.name} uploaded successfully`);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploadingFiles(prev => prev.filter(name => name !== fileName));
      }
    });

    await Promise.all(uploadPromises);
  };

  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.info("Voice recording stopped");
    } else {
      setIsRecording(true);
      toast.info("Voice recording started (feature coming soon!)");
      // Auto-stop after 5 seconds for demo
      setTimeout(() => setIsRecording(false), 5000);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim().length > 0 || attachments.length > 0) && !isDisabled && !isSending;

  return (
    <div className="border-t border-gray-800 bg-black/50 backdrop-blur-sm">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="p-3 border-b border-gray-800">
          <div className="flex flex-wrap gap-2">
            {attachments.map((url, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300 truncate max-w-32">
                  {url.split('/').pop()}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-gray-400 hover:text-red-400 ml-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploading files indicator */}
      {uploadingFiles.length > 0 && (
        <div className="p-3 border-b border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
            Uploading {uploadingFiles.length} file(s)...
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-2">
          {/* File upload and voice buttons */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-gray-400 hover:text-white"
                  disabled={isDisabled}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-48">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleFileUpload(files);
                  };
                  input.click();
                }}>
                  <Image className="h-4 w-4 mr-2" />
                  Upload Images
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10",
                isRecording ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-white"
              )}
              onClick={handleVoiceRecording}
              disabled={isDisabled}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>

          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              disabled={isDisabled}
              className={cn(
                "min-h-[44px] max-h-32 resize-none bg-gray-800 border-gray-700 text-white placeholder-gray-400 pr-12",
                "focus:border-green-500 focus:ring-green-500"
              )}
              rows={1}
            />
            
            {/* Emoji button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-white"
              onClick={() => toast.info("Emoji picker coming soon!")}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Send button */}
          <Button
            type="submit"
            disabled={!canSend}
            className={cn(
              "h-10 w-10 p-0 bg-green-600 hover:bg-green-700 text-white",
              canSend ? "opacity-100" : "opacity-50"
            )}
          >
            {isSending ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Character count and shortcuts hint */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>
            {message.length > 0 && `${message.length} characters`}
          </span>
          <span>
            Press Enter to send, Shift+Enter for new line
          </span>
        </div>
      </form>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e.target.files);
          }
        }}
      />
    </div>
  );
};

export default ChatInput;
