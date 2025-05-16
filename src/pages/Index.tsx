
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatsSection from "@/components/dashboard/StatsSection";
import RecentDocumentsSection from "@/components/dashboard/RecentDocumentsSection";
import TemplatesSection from "@/components/dashboard/TemplatesSection";
import AssessmentSection from "@/components/dashboard/AssessmentSection";
import LoginDialog from "@/components/auth/LoginDialog";
import { useAuth } from "@/contexts/AuthContext";
import { documentService } from "@/services/documentService";
import { toast } from "sonner";

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleUpload = async (file: File) => {
    try {
      const parsedDocument = await documentService.parseDocument(file);
      console.log("Parsed document:", parsedDocument);
      // In a real app, you would update state and use this data
      toast.success(`Document "${parsedDocument.title}" parsed successfully!`);
    } catch (error) {
      console.error("Error parsing document:", error);
      toast.error("Failed to parse document. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <WelcomeSection 
          username={user?.name || "there"} 
          isAuthenticated={isAuthenticated}
          onLogin={handleLogin}
          onUpload={handleUpload}
        />
        
        <StatsSection />
        
        <RecentDocumentsSection />
        
        <TemplatesSection />
        
        <AssessmentSection />
      </div>

      <LoginDialog 
        isOpen={loginDialogOpen} 
        onClose={() => setLoginDialogOpen(false)} 
      />
    </DashboardLayout>
  );
};

export default Index;
