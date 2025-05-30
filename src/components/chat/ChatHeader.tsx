
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Share, Download } from "lucide-react";
import { Conversation } from "@/services/conversationService";
import { Badge } from "@/components/ui/badge";
import ConversationRenameDialog from "./ConversationRenameDialog";
import { toast } from "sonner";

interface ChatHeaderProps {
  conversation: Conversation | null;
  onDelete?: () => void;
  onRename?: (newTitle: string) => void;
}

const ChatHeader = ({ conversation, onDelete, onRename }: ChatHeaderProps) => {
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  const getAdvisorBadge = (type: string) => {
    const badges = {
      general: { label: "General", variant: "default" as const },
      resume: { label: "Resume", variant: "secondary" as const },
      cover_letter: { label: "Cover Letter", variant: "outline" as const },
      interview_prep: { label: "Interview", variant: "destructive" as const },
      linkedin: { label: "LinkedIn", variant: "default" as const },
      job_search: { label: "Job Search", variant: "secondary" as const },
      assessment: { label: "Assessment", variant: "outline" as const },
    };
    return badges[type as keyof typeof badges] || badges.general;
  };

  const handleExport = () => {
    if (!conversation) return;
    
    const element = document.createElement("a");
    const data = {
      title: conversation.title,
      type: conversation.type,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at
    };
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `conversation-${conversation.id}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Conversation exported");
  };

  const handleShare = () => {
    if (!conversation) return;
    
    const shareData = {
      title: `AI Career Advisor - ${conversation.title}`,
      text: `Check out this conversation: ${conversation.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (!conversation) return null;

  const badge = getAdvisorBadge(conversation.type);

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold truncate text-white">
              {conversation.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={badge.variant} className="text-xs">
                {badge.label} Advisor
              </Badge>
              <span className="text-xs text-gray-400">
                {new Date(conversation.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-700">
            <DropdownMenuItem onClick={() => setShowRenameDialog(true)} className="text-gray-300 hover:text-white hover:bg-gray-800">
              <Edit3 className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare} className="text-gray-300 hover:text-white hover:bg-gray-800">
              <Share className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport} className="text-gray-300 hover:text-white hover:bg-gray-800">
              <Download className="h-4 w-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConversationRenameDialog
        isOpen={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        conversationId={conversation.id}
        currentTitle={conversation.title}
        onRename={(newTitle) => {
          onRename?.(newTitle);
          setShowRenameDialog(false);
        }}
      />
    </>
  );
};

export default ChatHeader;
