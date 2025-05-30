
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth/useAuth';
import { Bot, Sparkles } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import LoginDialog from '@/components/auth/LoginDialog';

const AuthPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/chat';
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { state: { createNew: true }, replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-3xl"
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative glass-card p-6">
                <Bot className="h-16 w-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sparkles className="absolute -top-2 -right-2 h-4 w-4 text-cyan-300" />
                  <Sparkles className="absolute -bottom-2 -left-2 h-3 w-3 text-blue-300" />
                  <Sparkles className="absolute top-1/2 -left-4 h-2 w-2 text-purple-300" />
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          <Logo size="lg" withLink={false} className="justify-center mb-6" />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-2"
          >
            <h1 className="text-2xl font-bold text-white">
              Welcome to Echo
            </h1>
            <p className="text-white/70 text-lg">
              Your intelligent career companion
            </p>
            <p className="text-white/50 text-sm">
              Sign in to unlock personalized career guidance
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <LoginDialog isOpen={true} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-8 text-white/60 text-sm"
        >
          <p>✨ Free to start • 🚀 No setup required • 🔒 Secure & private</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
