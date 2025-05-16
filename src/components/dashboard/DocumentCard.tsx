
import { FileText, Download, Share2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  id: string;
  title: string;
  type: "resume" | "cv" | "cover-letter";
  updatedAt: string;
  thumbnail?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DocumentCard = ({
  id,
  title,
  type,
  updatedAt,
  thumbnail,
  className,
  style,
}: DocumentCardProps) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "resume":
        return "Resume";
      case "cv":
        return "CV";
      case "cover-letter":
        return "Cover Letter";
      default:
        return "Document";
    }
  };

  return (
    <Card className={cn("document-card overflow-hidden", className)} style={style}>
      <div className="relative h-32 bg-muted overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary font-medium">
          {getTypeLabel(type)}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-1 text-base">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Updated {updatedAt}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button variant="outline" size="sm" className="gap-1">
          <Edit className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
