
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth/useAuth';
import { Bot } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import LoginDialog from '@/components/auth/LoginDialog';

const AuthPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/chat';
  
  useEffect(() => {
    if (isAuthenticated) {
      // Navigate to chat with state to create new conversation
      navigate(from, { state: { createNew: true }, replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative bg-black/50 backdrop-blur-sm border border-gray-700 rounded-full p-4">
                <Bot className="h-12 w-12 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500" />
              </div>
            </div>
          </div>
          
          <Logo size="lg" withLink={false} className="justify-center mb-4" />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-400 text-lg"
          >
            Your AI-powered career companion
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <LoginDialog isOpen={true} />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
