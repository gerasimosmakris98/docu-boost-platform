
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { conversationService } from "@/services/conversationService";

interface ConversationRenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  currentTitle: string;
  onRename: (newTitle: string) => void;
}

const ConversationRenameDialog = ({ 
  isOpen, 
  onClose, 
  conversationId, 
  currentTitle, 
  onRename 
}: ConversationRenameDialogProps) => {
  const [title, setTitle] = useState(currentTitle);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleRename = async () => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      await conversationService.updateConversation(conversationId, { title: title.trim() });
      onRename(title.trim());
      toast.success("Conversation renamed successfully");
      onClose();
    } catch (error) {
      console.error("Error renaming conversation:", error);
      toast.error("Failed to rename conversation");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Conversation</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter new title..."
            className="w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRename();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={isUpdating}>
            {isUpdating ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationRenameDialog;
