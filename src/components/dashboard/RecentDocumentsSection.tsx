
import { Button } from "@/components/ui/button";
import DocumentCard from "./DocumentCard";

const RecentDocumentsSection = () => {
  const documents = [
    {
      id: "1",
      title: "Senior Software Engineer Resume",
      type: "resume" as const,
      updatedAt: "2 days ago",
      thumbnail: "/placeholder.svg",
    },
    {
      id: "2",
      title: "Technical CV for R&D Positions",
      type: "cv" as const,
      updatedAt: "1 week ago",
      thumbnail: "/placeholder.svg",
    },
    {
      id: "3",
      title: "Cover Letter - Product Manager at Google",
      type: "cover-letter" as const,
      updatedAt: "3 days ago",
      thumbnail: "/placeholder.svg",
    },
    {
      id: "4",
      title: "UX Designer Resume with Portfolio Links",
      type: "resume" as const,
      updatedAt: "5 days ago",
      thumbnail: "/placeholder.svg",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Documents</h2>
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          View All
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {documents.map((document, index) => (
          <DocumentCard 
            key={document.id} 
            {...document} 
            className="animate-fadeIn" 
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentDocumentsSection;
