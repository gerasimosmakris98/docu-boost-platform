
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth/useAuth';
import { MessageCircle, Search, Image, Sparkles, ArrowRight, Zap, Heart, Shield } from 'lucide-react';
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
          className="h-12 w-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full"
        />
      </GradientBackground>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const quickActions = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Talk with AI Career Advisor",
      subtitle: "Start chatting now",
      variant: "primary" as const
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Chat with AI Career Advisor",
      subtitle: "Voice conversation",
      variant: "secondary" as const
    },
    {
      icon: <Image className="h-6 w-6" />,
      title: "Search by Image",
      subtitle: "Visual assistance",
      variant: "outline" as const
    }
  ];

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Lightning Fast",
      description: "Get instant responses powered by advanced AI technology"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Personalized",
      description: "Tailored career advice that grows with your journey"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security"
    }
  ];

  return (
    <GradientBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-16"
        >
          <Logo size="lg" withLink={false} className="text-white" />
          <ActionButton 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </ActionButton>
        </motion.div>

        {/* Hero Section */}
        <div className="text-center mb-20">
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Meet AI Career Advisor!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed max-w-3xl mx-auto">
              Your intelligent career companion that understands your ambitions and helps you achieve extraordinary success
            </p>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <ModernCard 
                  className="p-6 h-full cursor-pointer group"
                  gradient
                  hover
                  onClick={() => navigate('/auth')}
                >
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white mb-4 group-hover:scale-110 transition-transform duration-200">
                      {action.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                    <p className="text-white/70 text-sm">{action.subtitle}</p>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <ActionButton
              variant="primary"
              size="lg"
              icon={<Sparkles className="h-6 w-6" />}
              onClick={() => navigate('/auth')}
              className="text-xl px-12 py-4 shadow-2xl shadow-cyan-500/25"
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
          transition={{ duration: 0.8, delay: 1 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
            Why Choose AI Career Advisor?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
              >
                <ModernCard className="p-8 h-full text-center" gradient hover>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white mb-6 mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="text-center mt-20 pb-8"
        >
          <p className="text-white/70 mb-4 text-lg">
            Join thousands of professionals transforming their careers with AI Career Advisor
          </p>
          <p className="text-sm text-white/50">
            ✨ Free to start • 🚀 No credit card required • 🔒 Your data is secure
          </p>
        </motion.div>
      </div>
    </GradientBackground>
  );
};

export default WelcomePage;
