
import { Button } from "@/components/ui/button";
import TemplateCard from "./TemplateCard";

const TemplatesSection = () => {
  const templates = [
    {
      id: "1",
      title: "Modern Professional Resume",
      description: "Clean and minimal design for tech and corporate roles.",
      thumbnail: "/placeholder.svg",
    },
    {
      id: "2",
      title: "Creative Portfolio CV",
      description: "Visually striking layout for creative industries.",
      thumbnail: "/placeholder.svg",
    },
    {
      id: "3",
      title: "Executive Bio Template",
      description: "Elegant format for senior management positions.",
      thumbnail: "/placeholder.svg",
    },
    {
      id: "4",
      title: "Technical Cover Letter",
      description: "Structured template emphasizing technical expertise.",
      thumbnail: "/placeholder.svg",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Popular Templates</h2>
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          Browse Library
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {templates.map((template, index) => (
          <TemplateCard 
            key={template.id} 
            {...template} 
            className="animate-fadeIn" 
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplatesSection;
