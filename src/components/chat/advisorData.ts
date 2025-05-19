
import { Bot, FileText, Users, MessageSquare, Briefcase, Linkedin, CheckSquare } from "lucide-react";
import { ConversationType } from "@/services/types/conversationTypes";

export interface Advisor {
  id: string;
  name: string;
  type: ConversationType;
  icon: JSX.Element;
  description: string;
  profileFocus: string[];
}

export const advisors: Advisor[] = [
  {
    id: 'general',
    name: 'Career Advisor',
    type: 'general' as ConversationType,
    icon: <Bot className="h-4 w-4 text-green-400" />,
    description: 'General career guidance',
    profileFocus: ['summary', 'title', 'location', 'social_links']
  },
  {
    id: 'resume',
    name: 'Resume Advisor',
    type: 'resume' as ConversationType,
    icon: <FileText className="h-4 w-4 text-blue-400" />,
    description: 'Resume reviews and optimization',
    profileFocus: ['summary', 'title', 'experience']
  },
  {
    id: 'interview',
    name: 'Interview Advisor',
    type: 'interview_prep' as ConversationType,
    icon: <Users className="h-4 w-4 text-purple-400" />,
    description: 'Interview preparation and practice',
    profileFocus: ['summary', 'title', 'experience', 'skills']
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter Advisor',
    type: 'cover_letter' as ConversationType,
    icon: <MessageSquare className="h-4 w-4 text-yellow-400" />,
    description: 'Cover letter writing assistance',
    profileFocus: ['summary', 'title', 'experience']
  },
  {
    id: 'job-search',
    name: 'Job Search Advisor',
    type: 'job_search' as ConversationType,
    icon: <Briefcase className="h-4 w-4 text-orange-400" />,
    description: 'Job search strategy and advice',
    profileFocus: ['title', 'location', 'summary']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Advisor',
    type: 'linkedin' as ConversationType,
    icon: <Linkedin className="h-4 w-4 text-blue-500" />,
    description: 'LinkedIn profile optimization',
    profileFocus: ['summary', 'title', 'social_links']
  },
  {
    id: 'assessment',
    name: 'Assessment Advisor',
    type: 'assessment' as ConversationType,
    icon: <CheckSquare className="h-4 w-4 text-red-400" />,
    description: 'Assessment preparation',
    profileFocus: ['summary', 'skills', 'experience']
  }
];
