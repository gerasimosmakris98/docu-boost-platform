
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  FileUp, 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onFileUploaded: (url: string, fileName: string) => void;
  maxSizeMB?: number;
  allowedFileTypes?: string[];
}

const FileUpload = ({ 
  onFileUploaded, 
  maxSizeMB = 5, 
  allowedFileTypes = [
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ] 
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          await uploadFile(file);
          break;
        }
      }
    }
  };

  const uploadFile = async (file: File) => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      toast.error("File type not supported");
      return;
    }
    
    setIsUploading(true);
    try {
      // Generate a unique file name to prevent collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);
      
      onFileUploaded(publicUrlData.publicUrl, file.name);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getIconForFileType = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (
      fileType === 'application/pdf' || 
      fileType === 'application/msword' || 
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return <FileText className="h-5 w-5" />;
    }
    return <LinkIcon className="h-5 w-5" />;
  };

  return (
    <div 
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
        isDragging 
          ? "border-green-500 bg-green-500/10" 
          : "border-gray-700 hover:border-gray-600 bg-black/20",
        isUploading && "opacity-70 pointer-events-none"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleFileDrop}
      onClick={() => fileInputRef.current?.click()}
      onPaste={handlePaste}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept={allowedFileTypes.join(',')}
      />
      
      <div className="flex flex-col items-center justify-center py-3 text-sm">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-green-500" />
            <p>Uploading...</p>
          </>
        ) : (
          <>
            <FileUp className="h-8 w-8 mb-2 text-green-500" />
            <p className="mb-1">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">
              Supports images, PDFs, and documents (up to {maxSizeMB}MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
