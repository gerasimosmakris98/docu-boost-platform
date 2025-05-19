
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Upload, 
  Loader2, 
  FileUp,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { aiProviderService } from '@/services/ai/aiProviderService';
import { toast } from 'sonner';
import FileUpload from '@/components/common/FileUpload';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FileAnalyzerProps {
  onAnalysisComplete: (analysis: string) => void;
  conversationType?: string;
}

const FileAnalyzer = ({ onAnalysisComplete, conversationType = 'general' }: FileAnalyzerProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{url: string; name: string; type: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUploaded = (url: string, fileName: string, fileType: string) => {
    console.log('File uploaded:', { url, fileName, fileType });
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
      console.log('Analyzing file:', uploadedFile, 'for conversation type:', conversationType);
      
      // Get appropriate system prompt based on file type and conversation type
      let systemPrompt = "Analyze this file and provide helpful feedback.";
      
      if (uploadedFile.type.includes('pdf') || uploadedFile.type.includes('doc')) {
        if (conversationType === 'resume') {
          systemPrompt = "You are analyzing a resume. Provide specific, actionable feedback on its content, structure, and effectiveness. Focus on strengths and areas for improvement.";
        } else if (conversationType === 'cover_letter') {
          systemPrompt = "You are analyzing a cover letter. Provide specific, actionable feedback on its persuasiveness, relevance, and structure. Suggest improvements to better target the position.";
        } else {
          systemPrompt = "Analyze this document and provide helpful insights about its content and structure. Suggest improvements that would make it more effective.";
        }
      } else if (uploadedFile.type.includes('image')) {
        systemPrompt = "Analyze this image and describe its content. If it contains text, extract and analyze it. If it appears to be a document, profile, or other career-related content, provide relevant feedback.";
      }
      
      const analysis = await aiProviderService.analyzeFile(
        uploadedFile.url,
        uploadedFile.name,
        uploadedFile.type,
        systemPrompt
      );
      
      if (!analysis) {
        throw new Error("No analysis was returned");
      }
      
      console.log('Analysis received:', analysis.substring(0, 100) + '...');
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

  const getFileTypeGuidance = (): string => {
    if (conversationType === 'resume') {
      return "Upload your resume for personalized feedback (PDF or Word format recommended)";
    } else if (conversationType === 'cover_letter') {
      return "Upload your cover letter for analysis and suggestions";
    } else if (conversationType === 'linkedin') {
      return "Upload a screenshot of your LinkedIn profile for review";
    } else {
      return "Upload a file for AI analysis and feedback";
    }
  };

  const supportedFileTypes = [
    '.pdf', '.doc', '.docx', // Documents
    '.jpg', '.jpeg', '.png', '.gif', // Images
    '.txt' // Text files
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          {conversationType === 'resume' ? 'Resume Analysis' : 
           conversationType === 'cover_letter' ? 'Cover Letter Analysis' :
           conversationType === 'linkedin' ? 'LinkedIn Profile Analysis' :
           'File Analysis'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {!uploadedFile ? (
          <div className="space-y-2">
            <FileUpload 
              onFileUploaded={(url, fileName, fileType) => handleFileUploaded(url, fileName, fileType)} 
              maxSizeMB={10}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {getFileTypeGuidance()}
            </p>
            <div className="text-xs flex items-start gap-2 mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-md">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-400" />
              <span className="text-blue-200">
                Supported formats: {supportedFileTypes.join(', ')}. For best results with documents, use PDF format.
              </span>
            </div>
          </div>
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
              {conversationType === 'resume' ? 'Analyze Resume' : 
               conversationType === 'cover_letter' ? 'Analyze Cover Letter' :
               conversationType === 'linkedin' ? 'Analyze Profile' :
               'Analyze File'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileAnalyzer;
