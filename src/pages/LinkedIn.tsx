
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
import { useAuth } from "@/contexts/AuthContext";
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
import { LinkedInProfile } from "@/services/authService";
import { documentService } from "@/services/documentService";
import { conversationService } from "@/services/conversationService";

const LinkedInPage = () => {
  const { user, isAuthenticated, linkedInProfile } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [optimizationScore, setOptimizationScore] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate profile analysis if we have a profile
    if (linkedInProfile) {
      setOptimizationScore(linkedInProfile.profileScore || 
        Math.floor(Math.random() * 30) + 60); // 60-90 score range
    }
  }, [linkedInProfile]);

  const handleOptimizeProfile = () => {
    toast.success("Profile optimization suggestions generated!");
    // In a real app, this would trigger AI analysis
  };

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleProfileImported = (profile: LinkedInProfile) => {
    console.log("Profile imported in page component:", profile);
    // Any additional logic after import
  };

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

  const handleStartConversation = async (type: 'resume_feedback' | 'interview_prep') => {
    if (!isAuthenticated) {
      toast.error("Please sign in to continue");
      return;
    }
    
    try {
      // Create a specialized conversation
      const conversation = await conversationService.createSpecializedConversation(
        type,
        undefined, // No linked document yet
        type === 'interview_prep' ? "Software Engineer position at a tech company" : undefined
      );
      
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
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Linkedin className="h-6 w-6 text-[#0A66C2]" />
                LinkedIn Integration
              </h1>
              <p className="mt-2 text-gray-600 max-w-xl">
                Import your professional profile to enhance your resume and cover letters with your latest experience and skills.
              </p>
            </div>
            
            {!isAuthenticated && (
              <Button onClick={handleLogin} className="mt-4 md:mt-0">
                Sign In to Continue
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Import Section */}
          <LinkedInImport onProfileImported={handleProfileImported} />

          {/* Profile Optimization with new Optimizer component */}
          {linkedInProfile ? (
            <LinkedInOptimizer 
              profile={linkedInProfile}
              onCreateDocument={handleCreateDocument}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  Profile Optimization
                </CardTitle>
                <CardDescription>
                  Get AI-powered suggestions to improve your LinkedIn profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Import your LinkedIn profile first to get optimization suggestions
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleOptimizeProfile} 
                  disabled={!linkedInProfile}
                  className="w-full"
                >
                  Get Detailed Suggestions
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* AI-Powered Career Tools Section */}
        {linkedInProfile && (
          <div>
            <h2 className="text-xl font-semibold mb-4">AI-Powered Career Tools</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:border-blue-300 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    Resume Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600">
                    Get AI-powered feedback on your resume and suggestions for improvement.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full flex items-center justify-center gap-1" 
                    onClick={() => handleStartConversation('resume_feedback')}
                  >
                    Start Review <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:border-blue-300 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Interview Prep
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600">
                    Practice with AI-powered mock interviews tailored to your target roles.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full flex items-center justify-center gap-1" 
                    onClick={() => handleStartConversation('interview_prep')}
                  >
                    Start Prep <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:border-blue-300 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Skills Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-gray-600">
                    Analyze how your skills align with job market demands and get recommendations.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full flex items-center justify-center gap-1">
                    Analyze Skills <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Profile Preview */}
        {linkedInProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Your LinkedIn Profile</CardTitle>
              <CardDescription>
                Preview your imported professional information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.user_metadata?.full_name}</h3>
                    <p className="text-blue-600">{linkedInProfile.title}</p>
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                      <Building className="h-3.5 w-3.5" />
                      <span className="text-sm">{linkedInProfile.company}</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {linkedInProfile.summary && (
                  <div>
                    <h4 className="text-lg font-medium mb-2">Summary</h4>
                    <p className="text-gray-700">{linkedInProfile.summary}</p>
                  </div>
                )}

                {/* Experience */}
                <div>
                  <h4 className="text-lg font-medium mb-3 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" /> Experience
                  </h4>
                  <div className="space-y-4">
                    {linkedInProfile.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <h5 className="font-medium">{exp.title}</h5>
                        <p className="text-gray-600">{exp.company}</p>
                        <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-sm">{exp.duration}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 className="text-lg font-medium mb-3 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" /> Education
                  </h4>
                  <div className="space-y-4">
                    {linkedInProfile.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <h5 className="font-medium">{edu.degree}</h5>
                        <p className="text-gray-600">{edu.school}</p>
                        <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span className="text-sm">{edu.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-lg font-medium mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {linkedInProfile.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <LoginDialog 
        isOpen={loginDialogOpen} 
        onClose={() => setLoginDialogOpen(false)} 
      />
    </DashboardLayout>
  );
};

export default LinkedInPage;
