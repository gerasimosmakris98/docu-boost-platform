
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, Sparkles, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface WelcomeSectionProps {
  username?: string;
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onUpload?: (file: File) => void;
}

const WelcomeSection = ({ 
  username = "there", 
  isAuthenticated = false,
  onLogin,
  onUpload
}: WelcomeSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploading(true);
    
    // Simulate file processing with a timeout
    setTimeout(() => {
      if (onUpload) {
        onUpload(file);
      }
      setIsUploading(false);
      toast.success(`File "${file.name}" uploaded successfully`);
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 md:p-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Hello, {username}! 👋
          </h1>
          <p className="mt-2 text-gray-600 max-w-xl">
            Create professional documents, get assessments, and boost your career opportunities with AI-powered tools.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New
              </Button>
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button variant="outline" className="gap-2" disabled={isUploading}>
                  {isUploading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload
                </Button>
              </label>
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Assistant
              </Button>
            </>
          ) : (
            <Button onClick={onLogin} className="gap-2">
              Sign In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
