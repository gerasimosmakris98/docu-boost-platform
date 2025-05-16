
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  className?: string;
  style?: React.CSSProperties;
}

const TemplateCard = ({
  id,
  title,
  description,
  thumbnail,
  className,
  style,
}: TemplateCardProps) => {
  return (
    <Card className={cn("document-card overflow-hidden", className)} style={style}>
      <div className="relative h-40 bg-muted overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium line-clamp-1 text-base">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button variant="outline" className="w-full">Use Template</Button>
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;
