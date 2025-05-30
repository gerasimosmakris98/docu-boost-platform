
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth/useAuth';
import { MessageCircle, Image, Mic, Sparkles, ArrowRight, Users, Target, TrendingUp } from 'lucide-react';
import GradientBackground from '@/components/ui/GradientBackground';
import ModernCard from '@/components/ui/ModernCard';
import AnimatedBot from '@/components/ui/AnimatedBot';
import ActionButton from '@/components/ui/ActionButton';
import Logo from '@/components/ui/Logo';

const WelcomePage = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <GradientBackground className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-white/20 border-t-white rounded-full"
        />
      </GradientBackground>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to chat
  }

  const features = [
    {
      icon: <Target className="h-8 w-8" />,
      title: "Career Strategy",
      description: "Get personalized career roadmaps and strategic guidance tailored to your goals"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Interview Prep",
      description: "Practice with AI-powered mock interviews and receive detailed feedback"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Skill Development",
      description: "Identify gaps and get recommendations for courses and certifications"
    }
  ];

  const quickActions = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Chat with Echo",
      subtitle: "Start a conversation",
      variant: "primary" as const
    },
    {
      icon: <Image className="h-6 w-6" />,
      title: "Upload Resume",
      subtitle: "Get instant feedback",
      variant: "secondary" as const
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Voice Chat",
      subtitle: "Talk naturally",
      variant: "outline" as const
    }
  ];

  return (
    <GradientBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-12"
        >
          <Logo size="md" withLink={false} className="text-white" />
          <ActionButton 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </ActionButton>
        </motion.div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 flex justify-center"
          >
            <AnimatedBot />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Meet Echo!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
              Your AI-powered career companion that understands your ambitions and helps you achieve them
            </p>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {quickActions.map((action, index) => (
              <ActionButton
                key={action.title}
                variant={action.variant}
                icon={action.icon}
                onClick={() => navigate('/auth')}
                className="min-w-[200px]"
              >
                <div className="text-left">
                  <div className="font-semibold">{action.title}</div>
                  <div className="text-xs opacity-80">{action.subtitle}</div>
                </div>
              </ActionButton>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <ActionButton
              variant="primary"
              size="lg"
              icon={<Sparkles className="h-6 w-6" />}
              onClick={() => navigate('/auth')}
              className="text-xl px-12 py-4"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-6 w-6" />
            </ActionButton>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            Transform Your Career Journey
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
              >
                <ModernCard className="p-8 h-full" gradient hover>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-white/70 leading-relaxed">{feature.description}</p>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center mt-16 pb-8"
        >
          <p className="text-white/60 mb-4">
            Join thousands of professionals advancing their careers with AI
          </p>
          <p className="text-sm text-white/40">
            ✨ Free to start • 🚀 No credit card required • 🔒 Your data is secure
          </p>
        </motion.div>
      </div>
    </GradientBackground>
  );
};

export default WelcomePage;
