
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Users, Zap, TrendingUp } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const HomePage = () => {
  const features = [
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Smart Resume Builder",
      description: "Create professional resumes tailored to your industry and role with AI-powered suggestions."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Interview Preparation",
      description: "Practice with realistic interview scenarios and get personalized feedback to ace your interviews."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Career Guidance",
      description: "Get strategic advice on career moves, skill development, and professional growth opportunities."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Job Search Strategy",
      description: "Optimize your job search with targeted strategies and networking recommendations."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <div className="flex gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-white hover:text-green-400">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Your AI-Powered Career Companion
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Unlock your professional potential with personalized career guidance, resume optimization, 
            and interview preparation powered by advanced AI technology.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 text-lg">
              Start Your Career Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Transform Your Career with AI</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                <div className="flex justify-center mb-4 text-green-400">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Advance Your Career?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've accelerated their career growth with AI Career Advisor.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 text-lg">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <Logo size="md" />
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/legal/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/legal/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/legal/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2024 AI Career Advisor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
