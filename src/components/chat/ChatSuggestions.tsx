
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, FileText, Users, Briefcase, Lightbulb, Target } from "lucide-react";
import { motion } from "framer-motion";

interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  conversationType?: string;
}

const ChatSuggestions = ({ onSuggestionClick, conversationType = 'general' }: ChatSuggestionsProps) => {
  const getSuggestions = () => {
    switch (conversationType) {
      case 'resume':
        return [
          { icon: FileText, text: "Review my resume", prompt: "Can you help me review and improve my resume?", color: "text-blue-400" },
          { icon: Target, text: "Tailor for job posting", prompt: "Help me tailor my resume for a specific job posting.", color: "text-green-400" },
          { icon: Lightbulb, text: "Resume keywords", prompt: "What keywords should I include in my resume for my industry?", color: "text-purple-400" },
          { icon: FileText, text: "Create new resume", prompt: "I need help creating a professional resume from scratch.", color: "text-orange-400" },
        ];
      case 'cover_letter':
        return [
          { icon: MessageSquare, text: "Write a cover letter", prompt: "Help me write a compelling cover letter for a job application.", color: "text-blue-400" },
          { icon: Target, text: "Industry-specific letter", prompt: "Help me write a cover letter for my specific industry.", color: "text-green-400" },
          { icon: MessageSquare, text: "Cover letter template", prompt: "Can you provide a professional cover letter template?", color: "text-purple-400" },
          { icon: FileText, text: "Follow-up letter", prompt: "How do I write a follow-up letter after an interview?", color: "text-orange-400" },
        ];
      case 'interview_prep':
        return [
          { icon: Users, text: "Common questions", prompt: "What are the most common interview questions I should prepare for?", color: "text-blue-400" },
          { icon: Target, text: "STAR method", prompt: "Teach me how to use the STAR method for behavioral questions.", color: "text-green-400" },
          { icon: Users, text: "Practice interview", prompt: "Let's do a mock interview for my upcoming job interview.", color: "text-purple-400" },
          { icon: Lightbulb, text: "Questions to ask", prompt: "What questions should I ask the interviewer?", color: "text-orange-400" },
        ];
      case 'job_search':
        return [
          { icon: Briefcase, text: "Job search strategy", prompt: "Help me create an effective job search strategy.", color: "text-blue-400" },
          { icon: Users, text: "Networking tips", prompt: "What are the best ways to network in my industry?", color: "text-green-400" },
          { icon: Target, text: "LinkedIn optimization", prompt: "How can I optimize my LinkedIn profile for job searching?", color: "text-purple-400" },
          { icon: Lightbulb, text: "Salary negotiation", prompt: "Give me tips for negotiating my salary offer.", color: "text-orange-400" },
        ];
      default:
        return [
          { icon: FileText, text: "Review my resume", prompt: "Can you help me review and improve my resume?", color: "text-blue-400" },
          { icon: MessageSquare, text: "Write a cover letter", prompt: "Help me write a compelling cover letter.", color: "text-green-400" },
          { icon: Users, text: "Interview preparation", prompt: "Help me prepare for my upcoming job interview.", color: "text-purple-400" },
          { icon: Briefcase, text: "Job search advice", prompt: "I need advice on my job search strategy.", color: "text-orange-400" },
        ];
    }
  };

  const suggestions = getSuggestions();

  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">✨ Suggested prompts</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="p-4 bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 transition-all cursor-pointer group hover:border-green-500/30"
              onClick={() => onSuggestionClick(suggestion.prompt)}
            >
              <div className="flex items-start gap-3">
                <suggestion.icon className={`h-5 w-5 ${suggestion.color} flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                  {suggestion.text}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Click any suggestion to get started, or type your own message below
        </p>
      </div>
    </div>
  );
};

export default ChatSuggestions;
