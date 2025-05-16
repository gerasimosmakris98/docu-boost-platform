
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import LoginDialog from "@/components/auth/LoginDialog";
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Globe,
  MapPin,
  Mail,
  Phone,
  Link,
  FileText,
  Download,
  Share2,
} from "lucide-react";

// Sample resume data
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
  const { user, isAuthenticated } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("profile");
  
  // Use real user data if logged in, otherwise use sample data
  const profileData = isAuthenticated && user ? user : sampleResume.personal;
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
  
  const handleSaveChanges = () => {
    toast.success("Profile updated successfully!");
  };

  return (
    <DashboardLayout>
      {!isAuthenticated ? (
        <div className="mb-6 p-6 bg-muted/50 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in to view your profile</h2>
          <p className="text-muted-foreground mb-4">
            Create an account or sign in to view and manage your profile
          </p>
          <Button onClick={handleLogin}>Sign In</Button>
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
            {/* Profile Header */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="bg-primary/10 text-primary rounded-full w-20 h-20 flex items-center justify-center">
                    <User className="h-10 w-10" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{profileData.name || "Your Name"}</CardTitle>
                    <CardDescription className="text-lg">{profileData.title || "Your Title"}</CardDescription>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{profileData.location || "Your Location"}</span>
                    </div>
                  </div>
                  <Button className="mt-2 md:mt-0">Edit Profile</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.email || "email@example.com"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.phone || "Phone number"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.website || "Website"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-muted-foreground" />
                    <span>LinkedIn Profile</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  className="min-h-[120px]" 
                  placeholder="Write a professional summary..."
                  defaultValue={resumeData.summary}
                />
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Resume Tab */}
          <TabsContent value="resume" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Your Resume</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleDownloadResume}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleShareResume}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
            
            <Card className="p-6">
              <div className="space-y-8">
                {/* Resume Header */}
                <div className="border-b pb-6">
                  <h1 className="text-3xl font-bold">{resumeData.personal.name}</h1>
                  <p className="text-xl text-muted-foreground mt-1">{resumeData.personal.title}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {resumeData.personal.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {resumeData.personal.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {resumeData.personal.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {resumeData.personal.website}
                    </div>
                  </div>
                </div>
                
                {/* Summary */}
                <div>
                  <h2 className="text-xl font-semibold mb-2">Professional Summary</h2>
                  <p>{resumeData.summary}</p>
                </div>
                
                {/* Experience */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </h2>
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4">
                        <h3 className="font-semibold">{exp.title}</h3>
                        <div className="flex justify-between text-muted-foreground text-sm">
                          <div>{exp.company}, {exp.location}</div>
                          <div>{exp.period}</div>
                        </div>
                        <p className="mt-2 text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Education */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4">
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <div className="flex justify-between text-muted-foreground text-sm">
                          <div>{edu.school}, {edu.location}</div>
                          <div>{edu.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Skills */}
                <div>
                  <h2 className="text-xl font-semibold mb-3">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Certifications */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Certifications
                  </h2>
                  <div className="space-y-3">
                    {resumeData.certifications.map((cert, index) => (
                      <div key={index} className="border-l-2 border-primary/20 pl-4">
                        <h3 className="font-semibold">{cert.name}</h3>
                        <div className="flex justify-between text-muted-foreground text-sm">
                          <div>{cert.issuer}</div>
                          <div>{cert.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Languages */}
                <div>
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Languages
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {resumeData.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted/40 p-2 rounded">
                        <span>{lang.name}</span>
                        <span className="text-sm text-muted-foreground">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={profileData.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={profileData.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value="************" readOnly />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Notification settings would go here */}
                <p className="text-muted-foreground">Notification settings coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
