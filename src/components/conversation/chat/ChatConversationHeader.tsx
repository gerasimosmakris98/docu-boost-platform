
import { useState } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { Conversation } from "@/services/conversationService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FileAnalyzer from "@/components/conversation/FileAnalyzer";

interface ChatConversationHeaderProps {
  conversation: Conversation | null;
  loading: boolean;
  onAnalyzerOpen: () => void;
  onFileAnalysis: (analysis: string) => void;
}

const ChatConversationHeader = ({ 
  conversation, 
  loading, 
  onAnalyzerOpen,
  onFileAnalysis 
}: ChatConversationHeaderProps) => {
  const [showFileAnalyzer, setShowFileAnalyzer] = useState(false);
  
  const getConversationTitle = () => {
    if (loading) return "Loading...";
    if (!conversation) return "Chat";
    return conversation.title;
  };
  
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{getConversationTitle()}</CardTitle>
      <div className="flex items-center gap-2">
        <Dialog open={showFileAnalyzer} onOpenChange={(open) => {
          setShowFileAnalyzer(open);
          if (open) onAnalyzerOpen();
        }}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <FileText className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Analyze a File</DialogTitle>
              <DialogDescription>
                Upload a file to get AI analysis and feedback
              </DialogDescription>
            </DialogHeader>
            <FileAnalyzer onAnalysisComplete={onFileAnalysis} />
          </DialogContent>
        </Dialog>
      </div>
    </CardHeader>
  );
};

export default ChatConversationHeader;
