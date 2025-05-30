
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Share, Download, Wifi, WifiOff, Sparkles } from "lucide-react";
import { Conversation } from "@/services/conversationService";
import { Badge } from "@/components/ui/badge";
import ConversationRenameDialog from "../ConversationRenameDialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface EnhancedChatHeaderProps {
  conversation: Conversation | null;
  onDelete?: () => void;
  onRename?: (newTitle: string) => void;
  isOnline?: boolean;
}

const EnhancedChatHeader = ({ conversation, onDelete, onRename, isOnline = true }: EnhancedChatHeaderProps) => {
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  const getAdvisorBadge = (type: string) => {
    const badges = {
      general: { label: "General", variant: "default" as const, color: "from-blue-500/80 to-purple-500/80" },
      resume: { label: "Resume", variant: "secondary" as const, color: "from-green-500/80 to-emerald-500/80" },
      cover_letter: { label: "Cover Letter", variant: "outline" as const, color: "from-orange-500/80 to-red-500/80" },
      interview_prep: { label: "Interview", variant: "destructive" as const, color: "from-red-500/80 to-pink-500/80" },
      linkedin: { label: "LinkedIn", variant: "default" as const, color: "from-blue-600/80 to-blue-500/80" },
      job_search: { label: "Job Search", variant: "secondary" as const, color: "from-purple-500/80 to-indigo-500/80" },
      assessment: { label: "Assessment", variant: "outline" as const, color: "from-teal-500/80 to-cyan-500/80" },
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
      updated_at: conversation.updated_at,
      exported_at: new Date().toISOString()
    };
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `conversation-${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Conversation exported successfully");
  };

  const handleShare = async () => {
    if (!conversation) return;
    
    const shareData = {
      title: `AI Career Advisor - ${conversation.title}`,
      text: `Check out this career conversation: ${conversation.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Conversation shared successfully");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share conversation");
    }
  };

  if (!conversation) return null;

  const badge = getAdvisorBadge(conversation.type);

  return (
    <>
      <motion.div 
        className="sticky top-0 z-30 flex items-center justify-between p-4 border-b border-white/20 bg-white/5 backdrop-blur-md flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Connection status indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0"
          >
            <AnimatePresence mode="wait">
              {isOnline ? (
                <motion.div
                  key="online"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  className="text-green-400"
                >
                  <Wifi className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="offline"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  className="text-red-400"
                >
                  <WifiOff className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="min-w-0 flex-1">
            <motion.h1 
              className="text-lg font-semibold truncate text-white flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="h-4 w-4 text-blue-400" />
              {conversation.title}
            </motion.h1>
            <motion.div 
              className="flex items-center gap-2 mt-1 flex-wrap"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge 
                variant={badge.variant} 
                className={`text-xs flex-shrink-0 bg-gradient-to-r ${badge.color} border-white/20 text-white`}
              >
                {badge.label} Advisor
              </Badge>
              <span className="text-xs text-gray-300 flex-shrink-0">
                {new Date(conversation.updated_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-11 w-11 text-gray-300 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] flex-shrink-0 transition-all duration-200"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-black/80 backdrop-blur-xl border-white/20 z-[100] shadow-2xl"
              sideOffset={8}
            >
              <DropdownMenuItem 
                onClick={() => setShowRenameDialog(true)} 
                className="text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer h-11 min-h-[44px] focus:bg-white/10 focus:text-white transition-all"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Rename Conversation
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleShare} 
                className="text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer h-11 min-h-[44px] focus:bg-white/10 focus:text-white transition-all"
              >
                <Share className="h-4 w-4 mr-2" />
                Share Conversation
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleExport} 
                className="text-gray-200 hover:text-white hover:bg-white/10 cursor-pointer h-11 min-h-[44px] focus:bg-white/10 focus:text-white transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Conversation
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer h-11 min-h-[44px] focus:bg-red-500/10 focus:text-red-300 transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </motion.div>

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

export default EnhancedChatHeader;
