
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload, 
  Loader2, 
  FileUp,
  Check,
  AlertCircle 
} from 'lucide-react';
import { openaiService } from '@/services/openaiService';
import { toast } from 'sonner';
import FileUpload from '@/components/common/FileUpload';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FileAnalyzerProps {
  onAnalysisComplete: (analysis: string) => void;
}

const FileAnalyzer = ({ onAnalysisComplete }: FileAnalyzerProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{url: string; name: string; type: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUploaded = (url: string, fileName: string, fileType: string) => {
    setUploadedFile({
      url,
      name: fileName,
      type: fileType
    });
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError("Please upload a file first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysis = await openaiService.analyzeFile(
        uploadedFile.url,
        uploadedFile.name,
        uploadedFile.type
      );
      
      onAnalysisComplete(analysis);
      toast.success("File analysis complete");
    } catch (error: any) {
      console.error("Error analyzing file:", error);
      setError(error.message || "Failed to analyze file");
      toast.error("Failed to analyze file");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          File Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {!uploadedFile ? (
          <FileUpload 
            onFileUploaded={(url, fileName, fileType) => handleFileUploaded(url, fileName, fileType)} 
            maxSizeMB={10}
          />
        ) : (
          <div className="p-3 border rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="font-medium truncate max-w-xs">{uploadedFile.name}</span>
            </div>
            <Check className="h-4 w-4 text-green-500" />
          </div>
        )}
        
        {error && (
          <div className="mt-2 p-2 bg-red-900/20 border border-red-900/30 rounded-md text-red-200 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleAnalyze}
          disabled={!uploadedFile || isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <FileUp className="h-4 w-4 mr-2" />
              Analyze File
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileAnalyzer;
