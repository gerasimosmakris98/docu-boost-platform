
import { useEffect } from "react";
import { toast } from "sonner";

interface KeyboardShortcutsProps {
  onNewChat?: () => void;
  onSearch?: () => void;
  onToggleSidebar?: () => void;
}

const KeyboardShortcuts = ({ onNewChat, onSearch, onToggleSidebar }: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + N for new chat
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        onNewChat?.();
      }
      
      // Ctrl/Cmd + K for search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        onSearch?.();
      }
      
      // Ctrl/Cmd + B for toggle sidebar
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        onToggleSidebar?.();
      }
      
      // Ctrl/Cmd + / for help
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        toast.info("Keyboard shortcuts: Ctrl+N (New chat), Ctrl+K (Search), Ctrl+B (Toggle sidebar)");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onNewChat, onSearch, onToggleSidebar]);

  return null;
};

export default KeyboardShortcuts;
