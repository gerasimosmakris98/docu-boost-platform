
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Conversation } from "@/services/conversationService";

interface ConversationHeaderProps {
  conversation: Conversation | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const ConversationHeader = ({ conversation, isLoading, onRefresh }: ConversationHeaderProps) => {
  return (
    <div className="border-b p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{conversation?.title || "Conversation"}</h1>
          <p className="text-sm text-gray-500">
            {conversation?.type === 'resume' ? 'Resume Review Assistant' :
             conversation?.type === 'interview_prep' ? 'Interview Preparation Coach' :
             conversation?.type === 'cover_letter' ? 'Cover Letter Assistant' :
             conversation?.type === 'job_search' ? 'Job Search Strategist' :
             conversation?.type === 'linkedin' ? 'LinkedIn Optimization Expert' :
             'AI Career Assistant'}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default ConversationHeader;
