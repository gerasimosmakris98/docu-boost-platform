
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Paperclip, 
  FileText, 
  FileImage, 
  X, 
  File, 
  Link as LinkIcon,
  Upload 
} from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { toast } from 'sonner';
import FileUpload from '../common/FileUpload';
import { Input } from '../ui/input';

interface ChatAttachmentsProps {
  onAttach: (attachments: { url: string; type: string; name: string }[]) => void;
}

const ChatAttachments = ({ onAttach }: ChatAttachmentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'file' | 'link' | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [attachments, setAttachments] = useState<Array<{ url: string; type: string; name: string }>>([]);

  const handleFileUploaded = (url: string, fileName: string) => {
    // Determine file type based on extension
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    let type = 'document';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      type = 'image';
    } else if (['pdf'].includes(extension)) {
      type = 'pdf';
    }
    
    const newAttachment = { url, type, name: fileName };
    setAttachments([...attachments, newAttachment]);
    setAttachmentType(null);
    toast.success(`${fileName} attached successfully`);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }
    
    // Simple URL validation
    if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
      toast.error('URL must start with http:// or https://');
      return;
    }
    
    const newAttachment = { 
      url: linkUrl, 
      type: 'link', 
      name: new URL(linkUrl).hostname 
    };
    
    setAttachments([...attachments, newAttachment]);
    setLinkUrl('');
    setAttachmentType(null);
    toast.success('Link attached successfully');
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleDone = () => {
    if (attachments.length > 0) {
      onAttach(attachments);
      setAttachments([]);
    }
    setIsOpen(false);
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <FileImage className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 hover:text-gray-700"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-80">
          <div className="space-y-4">
            <h3 className="font-medium">Add Attachments</h3>
            
            {attachmentType === null && (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center py-4 h-auto"
                  onClick={() => setAttachmentType('file')}
                >
                  <Upload className="h-6 w-6 mb-2" />
                  <span>Upload File</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center py-4 h-auto"
                  onClick={() => setAttachmentType('link')}
                >
                  <LinkIcon className="h-6 w-6 mb-2" />
                  <span>Add Link</span>
                </Button>
              </div>
            )}
            
            {attachmentType === 'file' && (
              <div className="space-y-2">
                <FileUpload onFileUploaded={handleFileUploaded} />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAttachmentType(null)}
                >
                  Back
                </Button>
              </div>
            )}
            
            {attachmentType === 'link' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input 
                    type="url" 
                    placeholder="https://example.com" 
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                  <Button size="sm" onClick={handleAddLink}>Add</Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAttachmentType(null)}
                >
                  Back
                </Button>
              </div>
            )}
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Attached Files</h4>
                <div className="border rounded-md divide-y">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2 truncate">
                        {getAttachmentIcon(attachment.type)}
                        <span className="text-sm truncate">{attachment.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button onClick={handleDone}>
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatAttachments;
