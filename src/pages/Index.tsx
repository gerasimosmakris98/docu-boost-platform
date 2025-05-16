
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatsSection from "@/components/dashboard/StatsSection";
import RecentDocumentsSection from "@/components/dashboard/RecentDocumentsSection";
import TemplatesSection from "@/components/dashboard/TemplatesSection";
import AssessmentSection from "@/components/dashboard/AssessmentSection";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <WelcomeSection username="John" />
        
        <StatsSection />
        
        <RecentDocumentsSection />
        
        <TemplatesSection />
        
        <AssessmentSection />
      </div>
    </DashboardLayout>
  );
};

export default Index;
