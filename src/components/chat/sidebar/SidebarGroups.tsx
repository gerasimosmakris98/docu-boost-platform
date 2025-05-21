
import { useState } from "react";
import { Clock, Bot, FileText, Users, MessageSquare, Linkedin, Briefcase, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/services/conversationService";
import { conversationService, ConversationType } from "@/services/conversationService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SidebarGroupsProps {
  conversations: Conversation[];
  activeConversationId?: string;
  isCollapsed: boolean;
  isLoading: boolean;
  onToggleCollapse: () => void;
  onConversationDelete: (id: string, e: React.MouseEvent) => void;
  handleCreateConversation: (advisor: {id: string, name: string, type: ConversationType, icon: React.ReactNode}) => void;
}

// Define advisors data
const advisors = [
  {
    id: 'general',
    name: 'Career Advisor',
    type: 'general' as ConversationType,
    icon: <Bot className="h-4 w-4" />,
    description: 'General career guidance'
  },
  {
    id: 'resume',
    name: 'Resume Advisor',
    type: 'resume' as ConversationType,
    icon: <FileText className="h-4 w-4" />,
    description: 'Resume reviews and optimization'
  },
  {
    id: 'interview',
    name: 'Interview Advisor',
    type: 'interview_prep' as ConversationType,
    icon: <Users className="h-4 w-4" />,
    description: 'Interview preparation and practice'
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter Advisor',
    type: 'cover_letter' as ConversationType,
    icon: <MessageSquare className="h-4 w-4" />,
    description: 'Cover letter writing assistance'
  },
  {
    id: 'job-search',
    name: 'Job Search Advisor',
    type: 'job_search' as ConversationType,
    icon: <Briefcase className="h-4 w-4" />,
    description: 'Job search strategy and advice'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Advisor',
    type: 'linkedin' as ConversationType,
    icon: <Linkedin className="h-4 w-4" />,
    description: 'LinkedIn profile optimization'
  },
  {
    id: 'assessment',
    name: 'Assessment Advisor',
    type: 'assessment' as ConversationType,
    icon: <CheckSquare className="h-4 w-4" />,
    description: 'Assessment preparation'
  },
];

const SidebarGroups = ({ 
  conversations, 
  activeConversationId, 
  isCollapsed, 
  isLoading,
  onConversationDelete,
  handleCreateConversation
}: SidebarGroupsProps) => {
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-3 py-2 text-xs font-semibold text-gray-400">
        AI ADVISORS
      </div>
      
      <ScrollArea className="px-3 py-1 flex-none">
        <div className="space-y-1">
          {advisors.map((advisor) => (
            <Button
              key={advisor.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 h-9 px-2 text-gray-300 hover:text-white",
                isCollapsed && "justify-center p-0"
              )}
              onClick={() => handleCreateConversation(advisor)}
            >
              {advisor.icon}
              {!isCollapsed && <span>{advisor.name}</span>}
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      {conversations.length > 0 && (
        <>
          <div className={cn(
            "px-3 py-2 text-xs font-semibold text-gray-400 flex items-center mt-2",
            isCollapsed && "justify-center"
          )}>
            <Clock className="h-3 w-3 mr-1" />
            {!isCollapsed && "RECENT CHATS"}
          </div>
          
          <ScrollArea className="flex-1 px-1">
            <div className="space-y-1 px-2">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Loading...
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded text-sm group hover:bg-gray-800/70",
                      activeConversationId === conversation.id 
                        ? "bg-gray-800 text-white" 
                        : "text-gray-400"
                    )}
                  >
                    <Link 
                      to={`/chat/${conversation.id}`}
                      className="truncate flex-1"
                    >
                      {!isCollapsed && (
                        <span className="truncate">{conversation.title}</span>
                      )}
                      {isCollapsed && (
                        <div className="w-full flex justify-center">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                      )}
                    </Link>
                    
                    {!isCollapsed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => onConversationDelete(conversation.id, e)}
                        title="Delete conversation"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="14" 
                          height="14" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="text-gray-400 hover:text-red-400"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
};

export default SidebarGroups;
