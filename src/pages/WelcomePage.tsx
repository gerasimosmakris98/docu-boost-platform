
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/useAuth';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import UnifiedLayout from '@/components/layout/UnifiedLayout';

const WelcomePage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <UnifiedLayout showFooter={true}>
        <div className="flex items-center justify-center h-full">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      </UnifiedLayout>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to chat
  }

  return (
    <UnifiedLayout showFooter={true}>
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-4xl">
          <div className="mb-8">
            <Logo size="lg" withLink={false} className="justify-center mb-6" />
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Your AI Career Assistant
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Get personalized career advice, resume reviews, interview preparation, and job search strategies powered by advanced AI.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <div className="text-3xl mb-4">📝</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Resume & Cover Letters</h3>
              <p className="text-gray-400 text-sm">Professional resume reviews and cover letter writing assistance</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Interview Preparation</h3>
              <p className="text-gray-400 text-sm">Practice interviews and get personalized feedback</p>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-lg font-semibold mb-2 text-white">Career Strategy</h3>
              <p className="text-gray-400 text-sm">Job search strategies and career development guidance</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-12 px-8 text-lg"
            >
              Get Started - It's Free
            </Button>
            <p className="text-gray-500 text-sm">
              Join thousands of professionals advancing their careers with AI
            </p>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default WelcomePage;
