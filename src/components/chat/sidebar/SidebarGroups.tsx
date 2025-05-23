
import { useState, useMemo } from "react";
import { Clock, Bot, FileText, Users, MessageSquare, Linkedin, Briefcase, CheckSquare, ChevronDown, ChevronUp } from "lucide-react";
import { isToday, isYesterday, isThisWeek, isThisMonth, parseISO } from 'date-fns';
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
  const [showAllOlder, setShowAllOlder] = useState(false);
  const MAX_INITIALLY_SHOWN_OLDER = 3;

  const GROUP_ORDER: (keyof GroupedConversations)[] = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];

  interface GroupedConversations {
    Today: Conversation[];
    Yesterday: Conversation[];
    "This Week": Conversation[];
    "This Month": Conversation[];
    Older: Conversation[];
  }

  const groupedConversations = useMemo(() => {
    const groups: GroupedConversations = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: [],
    };

    // Assuming conversations are sorted: most recent first
    conversations.forEach((conversation) => {
      const date = parseISO(conversation.updated_at);
      if (isToday(date)) {
        groups.Today.push(conversation);
      } else if (isYesterday(date)) {
        groups.Yesterday.push(conversation);
      } else if (isThisWeek(date, { weekStartsOn: 1 })) {
        groups["This Week"].push(conversation);
      } else if (isThisMonth(date)) {
        groups["This Month"].push(conversation);
      } else {
        groups.Older.push(conversation);
      }
    });
    return groups;
  }, [conversations]);

  return (
    <div className="flex-1 flex flex-col"> {/* Removed overflow-hidden */}
      {/* AI Advisors Section */}
      {!isCollapsed && (
        <div className="px-3 py-2 text-xs font-semibold text-gray-400">
          AI ADVISORS
        </div>
      )}
      {isCollapsed && (
         <div className="px-3 py-2 text-xs font-semibold text-gray-400 flex justify-center">
            <Bot className="h-4 w-4" />
         </div>
      )}
      
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
              title={isCollapsed ? advisor.name : undefined}
            >
              {advisor.icon}
              {!isCollapsed && <span>{advisor.name}</span>}
            </Button>
          ))}
        </div>
      </ScrollArea>
      
      {/* Recent Chats Section */}
      <div className={cn(
        "px-3 py-2 text-xs font-semibold text-gray-400 flex items-center mt-2",
        isCollapsed && "justify-center"
      )}>
        <Clock className="h-3 w-3 mr-1" />
        {!isCollapsed && "RECENT CHATS"}
      </div>
          
      <ScrollArea className="flex-1 px-1">
        <div className="space-y-0.5 px-2">
          {isLoading ? (
            <div className={cn("text-center py-4 text-gray-500 text-sm", isCollapsed && "hidden")}>
              Loading chats...
            </div>
          ) : (
            GROUP_ORDER.map(groupName => {
              const groupConversations = groupedConversations[groupName];
              if (!groupConversations || groupConversations.length === 0) {
                return null;
              }

              const visibleConversations = 
                groupName === 'Older' && !showAllOlder 
                ? groupConversations.slice(0, MAX_INITIALLY_SHOWN_OLDER) 
                : groupConversations;

              return (
                <div key={groupName}>
                  {!isCollapsed && (
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-1 pt-3 pb-1 truncate">
                      {groupName}
                    </h4>
                  )}
                  {visibleConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "flex items-center justify-between px-2 py-1.5 rounded text-sm group hover:bg-gray-800/70",
                        activeConversationId === conversation.id 
                          ? "bg-gray-800 text-white" 
                          : "text-gray-400",
                        isCollapsed && "px-0 justify-center"
                      )}
                      title={isCollapsed ? conversation.title : undefined}
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
                            <MessageSquare className="h-4 w-4" /> {/* TODO: Use dynamic icon based on conversation type if available */}
                          </div>
                        )}
                      </Link>
                      
                      {!isCollapsed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
                  ))}
                  {groupName === 'Older' && groupConversations.length > MAX_INITIALLY_SHOWN_OLDER && !isCollapsed && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs mt-1 text-gray-400 hover:text-white"
                      onClick={() => setShowAllOlder(!showAllOlder)}
                    >
                      {showAllOlder ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5 mr-1" />
                          View Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5 mr-1" />
                          View More ({groupConversations.length - MAX_INITIALLY_SHOWN_OLDER} older)
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })
          )}
          {!isLoading && conversations.length === 0 && !isCollapsed && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No recent chats.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidebarGroups;

