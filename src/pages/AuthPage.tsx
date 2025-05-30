
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth/useAuth';
import { Bot, Sparkles, ArrowLeft } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import ActionButton from '@/components/ui/ActionButton';
import ModernCard from '@/components/ui/ModernCard';
import GradientBackground from '@/components/ui/GradientBackground';
import AuthForm from '@/components/auth/AuthForm';

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
    <GradientBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <Logo size="md" withLink={false} />
          <ActionButton
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate('/')}
          >
            Back to Home
          </ActionButton>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <ModernCard className="p-8" gradient>
            <div className="text-center mb-8">
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
                  Welcome to AI Career Advisor
                </h1>
                <p className="text-white/70 text-lg">
                  Your intelligent career companion
                </p>
                <p className="text-white/50 text-sm">
                  Sign in to unlock personalized career guidance
                </p>
              </motion.div>
            </div>
            
            <AuthForm />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center mt-8 text-white/60 text-sm"
            >
              <p>✨ Free to start • 🚀 No setup required • 🔒 Secure & private</p>
            </motion.div>
          </ModernCard>
        </motion.div>
      </div>
    </GradientBackground>
  );
};

export default AuthPage;
