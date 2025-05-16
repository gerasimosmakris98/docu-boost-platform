
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, Sparkles } from "lucide-react";

interface WelcomeSectionProps {
  username?: string;
}

const WelcomeSection = ({ username = "there" }: WelcomeSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 md:p-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Hello, {username}! 👋
          </h1>
          <p className="mt-2 text-gray-600 max-w-xl">
            Create professional documents, get assessments, and boost your career opportunities with AI-powered tools.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
