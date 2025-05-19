
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Bot } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please sign in to access this page');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="rounded-full bg-green-500/10 p-4 border border-green-500/20 mb-6">
          <Bot className="h-12 w-12 text-green-500" />
        </div>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-400 animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirection after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <div className="animate-fadeIn">{children}</div>;
};

export default ProtectedRoute;
