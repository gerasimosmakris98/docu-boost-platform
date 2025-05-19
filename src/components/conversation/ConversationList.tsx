
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Conversation, conversationService } from '@/services/conversationService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    navigate(`/chat/${conversation.id}`);
  };

  const confirmDelete = (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    setSelectedConversation(conversation);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedConversation) return;
    
    try {
      const success = await conversationService.deleteConversation(selectedConversation.id);
      
      if (success) {
        setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
        toast.success("Conversation deleted");
      } else {
        toast.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    } finally {
      setDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        No conversations yet. Start a new one!
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => handleConversationClick(conversation)}
            className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted cursor-pointer"
          >
            <div className="truncate">
              <div className="truncate font-medium">{conversation.title}</div>
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={(e) => confirmDelete(e, conversation)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedConversation?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConversationList;
