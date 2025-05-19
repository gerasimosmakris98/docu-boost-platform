
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { File, X, Upload, FileText, FileImage, FileArchive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onFileUploaded: (url: string, fileName: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  bucketName?: string;
  className?: string;
}

const FileUpload = ({
  onFileUploaded,
  acceptedTypes = "*",
  maxSizeMB = 10,
  bucketName = "documents",
  className = ""
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (!file) return;
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }
    
    setSelectedFile(file);
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type;
    
    if (fileType.startsWith("image/")) return <FileImage className="h-4 w-4" />;
    if (fileType.includes("pdf")) return <FileText className="h-4 w-4" />;
    if (fileType.includes("zip") || fileType.includes("compressed")) return <FileArchive className="h-4 w-4" />;
    
    return <File className="h-4 w-4" />;
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      // Generate a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      // Call the callback with the URL
      onFileUploaded(urlData.publicUrl, selectedFile.name);
      
      toast.success("File uploaded successfully");
      setSelectedFile(null);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };
  
  const cancelUpload = () => {
    setSelectedFile(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {!selectedFile ? (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="flex-1"
          />
        </div>
      ) : (
        <div className="border rounded-md p-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              {getFileIcon(selectedFile)}
              <span className="font-medium truncate">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">
                ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={cancelUpload}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-2 flex justify-end">
            <Button 
              onClick={uploadFile} 
              disabled={isUploading}
              size="sm"
              className="gap-1"
            >
              {isUploading ? "Uploading..." : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
