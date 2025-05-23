
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth/useAuth";
import LinkedInImport from "@/components/linkedin/LinkedInImport";
import LinkedInOptimizer from "@/components/linkedin/LinkedInOptimizer";
import { 
  Linkedin, 
  User, 
  Building, 
  GraduationCap, 
  Calendar, 
  Briefcase, 
  Star, 
  CheckCircle,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import LoginDialog from "@/components/auth/LoginDialog";
import { LinkedInProfile } from "@/contexts/auth/types";
import { documentService } from "@/services/documentService";
import { conversationService } from "@/services/conversationService";

const LinkedInPage = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isAuthenticated, user, linkedInProfile } = useAuth();
  const navigate = useNavigate();

  const handleCreateDocument = async (type: 'resume' | 'cover_letter') => {
    if (!isAuthenticated || !linkedInProfile) {
      toast.error("Please import your LinkedIn profile first");
      return;
    }
    
    try {
      // First we need to format the LinkedIn profile data for document generation
      const userProfile = {
        name: user?.user_metadata?.full_name || '',
        title: linkedInProfile.title || '',
        summary: linkedInProfile.summary || '',
        experience: linkedInProfile.experience.map(exp => ({
          title: exp.title,
          company: exp.company,
          duration: exp.duration,
          description: exp.description
        })),
        education: linkedInProfile.education.map(edu => ({
          degree: edu.degree,
          school: edu.school,
          year: edu.year
        })),
        skills: linkedInProfile.skills
      };
      
      // For cover letters, we'll ask the user to provide a job description in a future enhancement
      const jobDescription = type === 'cover_letter' 
        ? "This is a placeholder job description. In a future version, the app will ask for a specific job description."
        : "";
      
      toast.loading(`Generating your ${type === 'resume' ? 'resume' : 'cover letter'}...`);
      
      // Generate the document using the AI service
      const document = await documentService.generateDocument(
        type,
        userProfile,
        jobDescription
      );
      
      toast.dismiss();
      
      if (document) {
        toast.success(`Your ${type === 'resume' ? 'resume' : 'cover letter'} has been created!`);
        
        // Navigate to view the document
        navigate(`/documents/${document.id}`);
      } else {
        toast.error(`Failed to generate ${type === 'resume' ? 'resume' : 'cover letter'}`);
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      toast.error(`Failed to create ${type}`);
    }
  };

  const handleStartConversation = async (type: 'interview_prep' | 'resume') => {
    if (!isAuthenticated) {
      toast.error("Please sign in to continue");
      return;
    }
    
    try {
      // Create a specialized conversation
      const conversation = await conversationService.createSpecializedConversation(type);
      
      if (conversation) {
        // Navigate to the conversation
        navigate(`/conversations/${conversation.id}`);
      } else {
        throw new Error("Failed to create conversation");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LinkedIn Import Section */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-blue-500" />
                Import LinkedIn Profile
              </CardTitle>
              <CardDescription>
                Import your LinkedIn profile data to quickly populate your resume and cover letter.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Connect your LinkedIn account to automatically extract your profile information.
              </p>
              <LinkedInImport />
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={() => setIsImporting(true)}>
                Import Profile
              </Button>
            </CardFooter>
          </Card>

          {/* LinkedIn Optimization Section */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Optimize LinkedIn Profile
              </CardTitle>
              <CardDescription>
                Get AI-powered suggestions to improve your LinkedIn profile and increase visibility.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Analyze your profile and receive actionable recommendations to enhance your professional brand.
              </p>
              <LinkedInOptimizer profile={linkedInProfile || null} onCreateDocument={handleCreateDocument} />
            </CardContent>
            <CardFooter className="justify-end">
              <Button onClick={() => setIsOptimizing(true)}>
                Optimize Profile
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Actionable Buttons */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-500" />
                  Interview Preparation
                </CardTitle>
                <CardDescription>
                  Prepare for your next job interview with AI-powered practice questions and feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Simulate real interview scenarios and improve your responses.
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="link" className="text-green-500 hover:text-green-400" onClick={() => handleStartConversation('interview_prep')}>
                  Start Preparing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                  Resume Enhancement
                </CardTitle>
                <CardDescription>
                  Enhance your resume with AI-driven suggestions to highlight your skills and experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Optimize your resume to match job descriptions and stand out to recruiters.
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="link" className="text-blue-500 hover:text-blue-400" onClick={() => handleStartConversation('resume')}>
                  Enhance Resume
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors duration-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  Cover Letter Generation
                </CardTitle>
                <CardDescription>
                  Generate a compelling cover letter tailored to specific job applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">
                  Create personalized cover letters that showcase your qualifications and enthusiasm.
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="link" className="text-purple-500 hover:text-purple-400">
                  Generate Cover Letter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <LoginDialog isOpen={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
    </DashboardLayout>
  );
};

export default LinkedInPage;
