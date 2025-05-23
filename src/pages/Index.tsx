
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatsSection from "@/components/dashboard/StatsSection";
import RecentDocumentsSection from "@/components/dashboard/RecentDocumentsSection";
import TemplatesSection from "@/components/dashboard/TemplatesSection";
import AssessmentSection from "@/components/dashboard/AssessmentSection";
import { useAuth } from "@/contexts/auth/useAuth";
import { documentService } from "@/services/documentService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, FileText, PenBox, User } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState([]);

  const handleDocumentUpload = async (file: File) => {
    // Instead of parsing directly, read the file and create a document
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string || "";
      await documentService.createDocument(
        file.name || "Uploaded Document",
        "resume", // or determine from file type
        content
      );
    };
    reader.readAsText(file);
  };

  const handleNavigateToConversationType = (type: string) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    navigate(`/conversations?type=${type}`);
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch documents
      const fetchDocuments = async () => {
        const docs = await documentService.getDocuments();
        setDocuments(docs);
      };
      
      fetchDocuments();
    }
  }, [isAuthenticated]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <WelcomeSection 
          username={user?.user_metadata?.full_name || "there"} 
          isAuthenticated={isAuthenticated}
          onUpload={handleDocumentUpload}
        />
        
        <StatsSection />

        {/* AI Conversation Feature Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">AI-Powered Career Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Resume Builder Card */}
            <Card className="border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div 
                  className="flex flex-col items-center justify-center h-full space-y-4" 
                  onClick={() => handleNavigateToConversationType("resume")}
                >
                  <div className="p-3 rounded-full bg-blue-100">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold">AI Resume Builder</h3>
                  <p className="text-center text-gray-500 text-sm">
                    Create and customize your professional resume with AI guidance
                  </p>
                  <Button className="mt-2 w-full" variant="outline" onClick={() => navigate("/conversations")}>
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Cover Letter Assistant Card */}
            <Card className="border border-green-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div 
                  className="flex flex-col items-center justify-center h-full space-y-4"
                  onClick={() => handleNavigateToConversationType("cover_letter")}
                >
                  <div className="p-3 rounded-full bg-green-100">
                    <PenBox className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Cover Letter Assistant</h3>
                  <p className="text-center text-gray-500 text-sm">
                    Create tailored cover letters for specific job positions
                  </p>
                  <Button className="mt-2 w-full" variant="outline" onClick={() => navigate("/conversations")}>
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Interview Preparation Card */}
            <Card className="border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div 
                  className="flex flex-col items-center justify-center h-full space-y-4"
                  onClick={() => handleNavigateToConversationType("interview_prep")}
                >
                  <div className="p-3 rounded-full bg-purple-100">
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Interview Preparation</h3>
                  <p className="text-center text-gray-500 text-sm">
                    Practice for interviews with AI-generated questions and feedback
                  </p>
                  <Button className="mt-2 w-full" variant="outline" onClick={() => navigate("/conversations")}>
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <RecentDocumentsSection />
        
        <TemplatesSection />
        
        <AssessmentSection />
      </div>
    </DashboardLayout>
  );
};

export default Index;
