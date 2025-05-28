
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, FileText, Users, Briefcase } from "lucide-react";

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  conversationType?: string;
}

const ChatSuggestions = ({ onSuggestionClick, conversationType = 'general' }: ChatSuggestionsProps) => {
  const getSuggestions = () => {
    switch (conversationType) {
      case 'resume':
        return [
          { icon: FileText, text: "Review my resume", prompt: "Can you help me review and improve my resume?" },
          { icon: FileText, text: "Create a new resume", prompt: "I need help creating a professional resume from scratch." },
          { icon: FileText, text: "Tailor for job posting", prompt: "Help me tailor my resume for a specific job posting." },
          { icon: FileText, text: "Resume keywords", prompt: "What keywords should I include in my resume for my industry?" },
        ];
      case 'cover_letter':
        return [
          { icon: MessageSquare, text: "Write a cover letter", prompt: "Help me write a compelling cover letter for a job application." },
          { icon: MessageSquare, text: "Cover letter template", prompt: "Can you provide a professional cover letter template?" },
          { icon: MessageSquare, text: "Industry-specific letter", prompt: "Help me write a cover letter for my specific industry." },
          { icon: MessageSquare, text: "Follow-up letter", prompt: "How do I write a follow-up letter after an interview?" },
        ];
      case 'interview_prep':
        return [
          { icon: Users, text: "Common questions", prompt: "What are the most common interview questions I should prepare for?" },
          { icon: Users, text: "STAR method", prompt: "Teach me how to use the STAR method for behavioral questions." },
          { icon: Users, text: "Practice interview", prompt: "Let's do a mock interview for my upcoming job interview." },
          { icon: Users, text: "Questions to ask", prompt: "What questions should I ask the interviewer?" },
        ];
      case 'job_search':
        return [
          { icon: Briefcase, text: "Job search strategy", prompt: "Help me create an effective job search strategy." },
          { icon: Briefcase, text: "Networking tips", prompt: "What are the best ways to network in my industry?" },
          { icon: Briefcase, text: "LinkedIn optimization", prompt: "How can I optimize my LinkedIn profile for job searching?" },
          { icon: Briefcase, text: "Salary negotiation", prompt: "Give me tips for negotiating my salary offer." },
        ];
      default:
        return [
          { icon: FileText, text: "Review my resume", prompt: "Can you help me review and improve my resume?" },
          { icon: MessageSquare, text: "Write a cover letter", prompt: "Help me write a compelling cover letter." },
          { icon: Users, text: "Interview preparation", prompt: "Help me prepare for my upcoming job interview." },
          { icon: Briefcase, text: "Job search advice", prompt: "I need advice on my job search strategy." },
        ];
    }
  };

  const suggestions = getSuggestions();

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Suggested prompts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <Card 
            key={index} 
            className="p-3 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
            onClick={() => onSuggestionClick(suggestion.prompt)}
          >
            <div className="flex items-center gap-2">
              <suggestion.icon className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-sm text-gray-300 truncate">{suggestion.text}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
