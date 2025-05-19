
import { 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Paperclip,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatAttachmentProps {
  url: string;
  name?: string;
  onRemove?: () => void;
  isPreview?: boolean;
}

const ChatAttachment = ({ url, name, onRemove, isPreview = false }: ChatAttachmentProps) => {
  const fileExtension = url.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';
  const isUrl = url.startsWith('http') && !isImage && !isPdf;
  
  // Get filename from URL if not provided
  const fileName = name || url.split('/').pop() || url;
  
  if (isImage) {
    return (
      <div className="mt-2">
        <img 
          src={url} 
          alt="Attachment" 
          className="max-w-xs rounded-md border border-gray-800"
          onError={(e) => {
            // Hide broken images
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    );
  }
  
  if (isPdf) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs mt-1 p-2 bg-gray-800 rounded-md hover:bg-gray-700"
      >
        <FileText className="h-4 w-4" />
        <span className="truncate">{fileName}</span>
        {isPreview && onRemove && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 ml-1 hover:bg-gray-700 rounded-full p-0"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
          >
            <span className="sr-only">Remove</span>
            <X className="h-3 w-3" />
          </Button>
        )}
      </a>
    );
  }
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs mt-1 text-blue-400 hover:text-blue-300"
    >
      <LinkIcon className="h-3 w-3" />
      <span className="truncate">{url}</span>
      {isPreview && onRemove && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-4 w-4 ml-1 hover:bg-gray-700 rounded-full p-0"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
        >
          <span className="sr-only">Remove</span>
          <X className="h-3 w-3" />
        </Button>
      )}
    </a>
  );
};

export default ChatAttachment;
