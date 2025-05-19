
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, MessageSquare, Shield, Brain, Zap, UserCheck } from "lucide-react";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/chat");
    } else {
      navigate("/auth");
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="px-4 py-28 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent z-0"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary/10 to-transparent blur-3xl z-0"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
            Your Personal AI Career Advisor
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 animate-fadeIn">
            Get personalized help with your resume, interview preparation, and job search from our AI-powered career assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full animate-scaleIn"
              onClick={handleGetStarted}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full border-gray-700 hover:bg-gray-800 animate-scaleIn"
              onClick={() => navigate("/chat")}
            >
              Try Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">How Our AI Advisor Helps You</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MessageSquare className="h-8 w-8 text-primary" />}
              title="Resume Optimization"
              description="Get instant feedback on your resume and suggestions to make it stand out to recruiters and ATS systems."
            />
            
            <FeatureCard 
              icon={<Brain className="h-8 w-8 text-primary" />}
              title="Interview Preparation"
              description="Practice with AI-generated interview questions tailored to your industry and role."
            />
            
            <FeatureCard 
              icon={<UserCheck className="h-8 w-8 text-primary" />}
              title="LinkedIn Profile Analysis"
              description="Analyze your LinkedIn profile and get recommendations to optimize it for better visibility."
            />
            
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Skill Assessment"
              description="Identify your skill gaps and get personalized recommendations for improvement."
            />
            
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Job Search Strategy"
              description="Develop an effective job search strategy tailored to your career goals and market demands."
            />
            
            <FeatureCard 
              icon={<MessageSquare className="h-8 w-8 text-primary" />}
              title="Cover Letter Writing"
              description="Generate customized cover letters that highlight your relevant experience and skills."
            />
          </div>
        </div>
      </section>
      
      {/* Demo Chat Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-6">See It In Action</h2>
          <p className="text-lg text-gray-300 text-center max-w-3xl mx-auto mb-12">
            Experience how our AI career advisor can help you with personalized guidance and feedback.
          </p>
          
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
            <div className="border-b border-gray-800 p-4">
              <h3 className="font-medium text-lg">Chat with AI Advisor</h3>
            </div>
            
            <div className="p-4 h-96 overflow-y-auto space-y-4">
              <ChatMessage 
                role="assistant"
                message="Hello! I'm your AI career advisor. How can I help you today with your career goals?"
              />
              
              <ChatMessage 
                role="user"
                message="I need help optimizing my resume for a software developer position."
              />
              
              <ChatMessage 
                role="assistant"
                message="I'd be happy to help with your software developer resume! Here are some key tips to optimize it:

1. Highlight your technical skills prominently in a dedicated skills section
2. Quantify your achievements with specific metrics and results
3. Include relevant projects with links to repositories if applicable
4. Ensure your resume is ATS-friendly with appropriate keywords

Would you like me to review your current resume or help you create a new one?"
              />
              
              <ChatMessage 
                role="user"
                message="I'd like to know what skills are currently in demand for software developers."
              />
              
              <ChatMessage 
                role="assistant"
                message="Based on current market trends, these skills are highly in demand for software developers:

• Programming Languages: JavaScript, Python, Java, TypeScript
• Frontend: React, Vue.js, Angular
• Backend: Node.js, Django, Spring Boot
• Cloud: AWS, Azure, Google Cloud
• DevOps: Docker, Kubernetes, CI/CD
• Database: SQL, MongoDB, PostgreSQL
• AI/ML: TensorFlow, PyTorch (growing rapidly)

Would you like more details on any specific area?"
              />
            </div>
            
            <div className="border-t border-gray-800 p-4 flex gap-2">
              <Button onClick={() => navigate("/auth")} className="w-full">
                Sign Up to Chat with AI Advisor
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="px-4 py-12 sm:px-6 lg:px-8 bg-black border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to advance your career?</h2>
          <Button 
            size="lg" 
            className="px-8 mb-8"
            onClick={handleGetStarted}
          >
            Start Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="text-gray-400 text-sm">
            <p>© 2023 AI Career Advisor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-primary/50 transition-colors card-hover">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const ChatMessage = ({ role, message }: { role: 'assistant' | 'user', message: string }) => (
  <div className={`flex ${role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
      role === 'assistant' 
        ? 'bg-gray-800 text-white' 
        : 'bg-primary text-primary-foreground'
    }`}>
      <p className="whitespace-pre-line">{message}</p>
    </div>
  </div>
);

export default HomePage;
