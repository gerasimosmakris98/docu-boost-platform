
import { useNavigate } from 'react-router-dom';
import { Briefcase, FileText, Linkedin, MessageSquare, User, Users, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { conversationService, ConversationType } from '@/services/conversationService';
import { toast } from 'sonner';

interface Advisor {
  id: string;
  name: string;
  type: ConversationType;
  icon: React.ReactNode;
  description: string;
}

const advisors: Advisor[] = [
  {
    id: 'general',
    name: 'Career Advisor',
    type: 'general',
    icon: <User className="h-4 w-4" />,
    description: 'General career guidance and advice'
  },
  {
    id: 'resume',
    name: 'Resume Advisor',
    type: 'resume',
    icon: <FileText className="h-4 w-4" />,
    description: 'Resume reviews and optimization'
  },
  {
    id: 'interview',
    name: 'Interview Advisor',
    type: 'interview_prep',
    icon: <Users className="h-4 w-4" />,
    description: 'Interview preparation and practice'
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter Advisor',
    type: 'cover_letter',
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Cover letter writing assistance'
  },
  {
    id: 'job-search',
    name: 'Job Search Advisor',
    type: 'job_search',
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Job search strategy and advice'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Advisor',
    type: 'linkedin',
    icon: <Linkedin className="h-4 w-4" />,
    description: 'LinkedIn profile optimization'
  },
  {
    id: 'assessment',
    name: 'Assessment Advisor',
    type: 'assessment',
    icon: <CheckSquare className="h-4 w-4" />,
    description: 'Assessment and test preparation'
  }
];

const AdvisorList = () => {
  const navigate = useNavigate();

  const startConversation = async (advisor: Advisor) => {
    try {
      toast.loading(`Starting conversation with ${advisor.name}...`);
      const conversation = await conversationService.createSpecializedConversation(advisor.type);
      
      if (conversation) {
        navigate(`/chat/${conversation.id}`);
        toast.dismiss();
      } else {
        toast.error("Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  return (
    <div className="space-y-2">
      {advisors.map((advisor) => (
        <Button
          key={advisor.id}
          variant="ghost"
          className="w-full justify-start gap-2 h-10 px-2"
          onClick={() => startConversation(advisor)}
        >
          {advisor.icon}
          <span>{advisor.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default AdvisorList;
