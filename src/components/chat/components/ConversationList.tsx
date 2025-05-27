
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/services/conversationService";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onCreateNew: () => void;
  isCollapsed: boolean;
}

const ConversationList = ({ 
  conversations, 
  activeConversationId, 
  onCreateNew,
  isCollapsed 
}: ConversationListProps) => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  
  // Group conversations by date
  const groupConversationsByDate = (conversations: Conversation[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = {
      today: [] as Conversation[],
      yesterday: [] as Conversation[],
      thisWeek: [] as Conversation[],
      older: [] as Conversation[]
    };

    conversations.forEach(conv => {
      const convDate = new Date(conv.updated_at);
      const convDateOnly = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

      if (convDateOnly.getTime() === today.getTime()) {
        groups.today.push(conv);
      } else if (convDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(conv);
      } else if (convDate >= lastWeek) {
        groups.thisWeek.push(conv);
      } else {
        groups.older.push(conv);
      }
    });

    return groups;
  };

  const groupedConversations = groupConversationsByDate(conversations);
  const totalConversations = conversations.length;
  const displayLimit = 10;
  
  // Show limited conversations unless "View All" is clicked
  const displayConversations = showAll ? conversations : conversations.slice(0, displayLimit);
  const hasMore = totalConversations > displayLimit;

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  const getConversationIcon = (type: string) => {
    return <MessageSquare className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderConversationGroup = (title: string, conversations: Conversation[]) => {
    if (conversations.length === 0) return null;

    return (
      <div key={title} className="mb-4">
        {!isCollapsed && (
          <h3 className="text-xs font-medium text-gray-400 mb-2 px-3">
            {title}
          </h3>
        )}
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              onClick={() => handleConversationClick(conversation.id)}
              className={cn(
                "w-full justify-start text-left h-auto p-3 hover:bg-gray-800",
                activeConversationId === conversation.id && "bg-gray-800 text-white",
                isCollapsed && "px-2 py-2"
              )}
            >
              <div className="flex items-center gap-3 w-full min-w-0">
                <div className="flex-shrink-0 text-gray-400">
                  {getConversationIcon(conversation.type)}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-white truncate">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(conversation.updated_at)}
                    </div>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  if (isCollapsed) {
    return (
      <div className="p-2">
        <Button
          onClick={onCreateNew}
          size="icon"
          className="w-full mb-4 bg-green-600 hover:bg-green-700"
          aria-label="Start new conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1">
            {displayConversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                onClick={() => handleConversationClick(conversation.id)}
                className={cn(
                  "w-full p-2 hover:bg-gray-800",
                  activeConversationId === conversation.id && "bg-gray-800 text-white"
                )}
                aria-label={conversation.title}
              >
                <div className="text-gray-400">
                  {getConversationIcon(conversation.type)}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={onCreateNew}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <Separator className="bg-gray-800" />

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 mt-8 px-4">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : showAll ? (
          // Show grouped conversations when "View All" is active
          <div className="py-2">
            {renderConversationGroup("Today", groupedConversations.today)}
            {renderConversationGroup("Yesterday", groupedConversations.yesterday)}
            {renderConversationGroup("This Week", groupedConversations.thisWeek)}
            {renderConversationGroup("Older", groupedConversations.older)}
          </div>
        ) : (
          // Show limited list
          <div className="py-2">
            <div className="space-y-1">
              {displayConversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  onClick={() => handleConversationClick(conversation.id)}
                  className={cn(
                    "w-full justify-start text-left h-auto p-3 hover:bg-gray-800",
                    activeConversationId === conversation.id && "bg-gray-800 text-white"
                  )}
                >
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <div className="flex-shrink-0 text-gray-400">
                      {getConversationIcon(conversation.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white truncate">
                        {conversation.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(conversation.updated_at)}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* View All / Show Less Button */}
        {hasMore && (
          <div className="px-2 py-3">
            <Button
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
              className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  View All ({totalConversations})
                </>
              )}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
