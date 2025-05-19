
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Linkedin, 
  User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { conversationService, ConversationType } from '@/services/conversationService';

interface AdvisorOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: ConversationType;
}

const advisorOptions: AdvisorOption[] = [
  {
    id: 'general',
    name: 'Career Advisor',
    description: 'General career guidance and advice for your professional journey',
    icon: <User className="h-6 w-6" />,
    type: 'general'
  },
  {
    id: 'resume',
    name: 'Resume Advisor',
    description: 'Get expert feedback and optimization for your resume',
    icon: <FileText className="h-6 w-6" />,
    type: 'resume'
  },
  {
    id: 'interview',
    name: 'Interview Advisor',
    description: 'Prepare for your interviews with personalized coaching',
    icon: <Users className="h-6 w-6" />,
    type: 'interview_prep'
  },
  {
    id: 'cover_letter',
    name: 'Cover Letter Advisor',
    description: 'Craft compelling cover letters tailored to specific jobs',
    icon: <MessageSquare className="h-6 w-6" />,
    type: 'cover_letter'
  },
  {
    id: 'job_search',
    name: 'Job Search Advisor',
    description: 'Develop an effective strategy for finding your next role',
    icon: <Briefcase className="h-6 w-6" />,
    type: 'job_search'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Advisor',
    description: 'Optimize your LinkedIn profile for better visibility',
    icon: <Linkedin className="h-6 w-6" />,
    type: 'linkedin'
  }
];

const NewChat = () => {
  const navigate = useNavigate();

  const startConversation = async (advisor: AdvisorOption) => {
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
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">AI Career Advisor</h1>
        <p className="text-muted-foreground mt-2">Select an advisor to start your personalized career coaching session</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {advisorOptions.map((advisor) => (
          <Card 
            key={advisor.id}
            className="overflow-hidden transition-colors hover:bg-accent/10 cursor-pointer"
            onClick={() => startConversation(advisor)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  {advisor.icon}
                </div>
                <CardTitle>{advisor.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <CardDescription>{advisor.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewChat;
