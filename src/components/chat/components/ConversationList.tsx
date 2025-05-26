
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { MessageSquare, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Conversation } from "@/services/conversationService";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onCreateNew: () => void;
  isCollapsed?: boolean;
}

interface ConversationGroup {
  label: string;
  conversations: Conversation[];
}

const ConversationList = ({ 
  conversations, 
  activeConversationId, 
  onCreateNew,
  isCollapsed = false 
}: ConversationListProps) => {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  
  // Group conversations by time periods
  const groupedConversations = (): ConversationGroup[] => {
    if (conversations.length === 0) return [];
    
    const groups: ConversationGroup[] = [];
    let currentGroup: ConversationGroup | null = null;
    
    conversations.forEach(conversation => {
      const date = new Date(conversation.updated_at);
      let label = '';
      
      if (isToday(date)) {
        label = 'Today';
      } else if (isYesterday(date)) {
        label = 'Yesterday';
      } else if (isThisWeek(date)) {
        label = 'This Week';
      } else if (isThisMonth(date)) {
        label = 'This Month';
      } else {
        label = format(date, 'MMMM yyyy');
      }
      
      if (!currentGroup || currentGroup.label !== label) {
        currentGroup = { label, conversations: [] };
        groups.push(currentGroup);
      }
      
      currentGroup.conversations.push(conversation);
    });
    
    return groups;
  };

  const groups = groupedConversations();
  
  // Limit conversations shown initially
  const INITIAL_LIMIT = 10;
  const shouldShowViewAll = conversations.length > INITIAL_LIMIT;
  
  const getDisplayGroups = () => {
    if (showAll || !shouldShowViewAll) return groups;
    
    // Show only first 10 conversations across all groups
    let count = 0;
    const limitedGroups: ConversationGroup[] = [];
    
    for (const group of groups) {
      if (count >= INITIAL_LIMIT) break;
      
      const remainingSlots = INITIAL_LIMIT - count;
      const conversationsToShow = group.conversations.slice(0, remainingSlots);
      
      if (conversationsToShow.length > 0) {
        limitedGroups.push({
          label: group.label,
          conversations: conversationsToShow
        });
        count += conversationsToShow.length;
      }
    }
    
    return limitedGroups;
  };

  const displayGroups = getDisplayGroups();

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  if (isCollapsed) {
    return (
      <div className="py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCreateNew}
          className="w-full h-10 mb-2"
          title="New Conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1 px-2">
            {conversations.slice(0, 8).map((conversation) => (
              <Button
                key={conversation.id}
                variant={activeConversationId === conversation.id ? "secondary" : "ghost"}
                size="icon"
                onClick={() => handleConversationClick(conversation.id)}
                className="w-full h-10"
                title={conversation.title}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <Button
          onClick={onCreateNew}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {displayGroups.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`} className="space-y-1">
              <div className="sticky top-0 z-10 bg-black/95 backdrop-blur py-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-800"></div>
                  <span className="text-xs font-medium text-gray-400 px-2">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-gray-800"></div>
                </div>
              </div>
              
              {group.conversations.map((conversation) => (
                <NavLink
                  key={conversation.id}
                  to={`/chat/${conversation.id}`}
                  className={({ isActive }) => cn(
                    "block w-full p-3 rounded-lg text-left transition-colors",
                    "hover:bg-gray-900/50 group",
                    isActive 
                      ? "bg-green-600/20 border border-green-600/30 text-green-400" 
                      : "text-gray-300 hover:text-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(conversation.updated_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          ))}
          
          {shouldShowViewAll && (
            <>
              <Separator className="my-4" />
              <Button
                variant="ghost"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-sm text-gray-400 hover:text-white"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    View All ({conversations.length} conversations)
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
