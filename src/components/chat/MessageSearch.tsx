
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  className?: string;
}

const MessageSearch = ({ onSearch, onClear, className }: MessageSearchProps) => {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery("");
    setIsExpanded(false);
    onClear();
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {isExpanded ? (
        <div className="flex items-center gap-1 flex-1 max-w-48">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              placeholder="Search..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-7 h-7 text-xs bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="h-6 w-6 text-gray-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="h-6 w-6 text-gray-400 hover:text-white"
          title="Search messages"
        >
          <Search className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default MessageSearch;
