import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import LoginDialog from "@/components/auth/LoginDialog";
import ProfileTab from "@/components/profile/ProfileTab";
import ResumeTab from "@/components/profile/ResumeTab";
import SettingsTab from "@/components/profile/SettingsTab";

// Sample resume data (will use for non-auth users or as fallback)
const sampleResume = {
  personal: {
    name: "Alex Johnson",
    title: "Senior Software Engineer",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "alexjohnson.dev",
  },
  summary: "Senior Software Engineer with 8+ years of experience developing scalable web applications using React, Node.js, and TypeScript. Passionate about clean code, performance optimization, and creating intuitive user experiences.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      period: "Jan 2020 - Present",
      description: "Lead developer for the company's flagship product, a SaaS platform serving over 50,000 users. Implemented microservices architecture that improved system reliability by 35% and reduced latency by 42%.",
    },
    {
      title: "Software Engineer",
      company: "WebSolutions LLC",
      location: "Austin, TX",
      period: "Mar 2017 - Dec 2019",
      description: "Developed and maintained client-facing applications using React and Redux. Collaborated with UX designers to implement responsive interfaces that increased user engagement by 28%.",
    },
    {
      title: "Junior Developer",
      company: "StartupHub",
      location: "Portland, OR",
      period: "Jun 2015 - Feb 2017",
      description: "Built interactive front-end components using JavaScript and jQuery. Participated in code reviews and agile development processes.",
    },
  ],
  education: [
    {
      degree: "Master of Science in Computer Science",
      school: "Stanford University",
      location: "Stanford, CA",
      year: "2015",
    },
    {
      degree: "Bachelor of Science in Computer Engineering",
      school: "University of Washington",
      location: "Seattle, WA",
      year: "2013",
    },
  ],
  skills: [
    "JavaScript/TypeScript",
    "React",
    "Node.js",
    "GraphQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "System Design",
    "Agile Methodologies",
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "Spanish", level: "Professional" },
    { name: "French", level: "Basic" },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      year: "2022",
    },
    {
      name: "Google Cloud Professional Developer",
      issuer: "Google",
      year: "2021",
    },
  ],
};

const Profile = () => {
  const { user, profile, isAuthenticated, refreshProfile, updateProfile } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("profile");
  
  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    }
  }, [isAuthenticated, refreshProfile]);
  
  // Use real user data if logged in, otherwise use sample data
  const profileData = isAuthenticated && profile ? {
    name: profile.full_name || user?.user_metadata?.full_name || 'Anonymous User',
    title: profile.title || 'Professional',
    email: user?.email || 'email@example.com',
    phone: profile.phone || '',
    location: profile.location || '',
    website: profile.website || '',
  } : sampleResume.personal;
  
  const resumeData = sampleResume;

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleDownloadResume = () => {
    toast.success("Resume downloaded successfully!");
  };
  
  const handleShareResume = () => {
    toast.success("Resume link copied to clipboard!");
  };
  
  const handleSaveChanges = async (updates: any) => {
    if (isAuthenticated) {
      try {
        await updateProfile(updates);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    } else {
      toast.error("Please log in to save your changes");
      setLoginDialogOpen(true);
    }
  };

  return (
    <DashboardLayout>
      {!isAuthenticated ? (
        <div className="mb-6 p-6 bg-muted/50 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in to view your profile</h2>
          <p className="text-muted-foreground mb-4">
            Create an account or sign in to view and manage your profile
          </p>
          <button 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
            onClick={handleLogin}
          >
            Sign In
          </button>
          <LoginDialog
            isOpen={loginDialogOpen}
            onClose={() => setLoginDialogOpen(false)}
          />
        </div>
      ) : null}

      <div className="space-y-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="settings">Account Settings</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileTab 
              profileData={profileData}
              resumeData={{
                summary: profile?.summary || resumeData.summary
              }}
              onSaveChanges={handleSaveChanges}
            />
          </TabsContent>
          
          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-6">
            <ResumeTab 
              resumeData={resumeData}
              onDownload={handleDownloadResume}
              onShare={handleShareResume}
            />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsTab 
              profileData={{
                name: profile?.full_name || user?.user_metadata?.full_name || 'Anonymous User',
                email: user?.email || 'email@example.com'
              }}
              onSaveChanges={handleSaveChanges}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
