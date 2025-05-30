
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessageSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  className?: string;
}

const MessageSearch = ({ onSearch, onClear, className }: MessageSearchProps) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    setIsExpanded(false);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {isExpanded ? (
        <div className={cn(
          "flex items-center gap-1 flex-1",
          isMobile ? "max-w-24" : "max-w-32"
        )}>
          <div className="relative flex-1">
            <Search className="absolute left-1.5 top-1/2 transform -translate-y-1/2 h-2.5 w-2.5 text-gray-400" />
            <Input
              placeholder={isMobile ? "Search..." : "Search messages..."}
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                "pl-5 h-6 text-xs bg-gray-800 border-gray-700 text-white placeholder-gray-400",
                "focus:border-green-500 focus:ring-green-500/20"
              )}
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-5 w-5 text-gray-400 hover:text-white p-0 flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="h-5 w-5 text-gray-400 hover:text-white p-0"
          title="Search messages"
          aria-label="Search messages"
        >
          <Search className="h-2.5 w-2.5" />
        </Button>
      )}
    </div>
  );
};

export default MessageSearch;
