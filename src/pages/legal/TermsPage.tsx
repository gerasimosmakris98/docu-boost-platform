
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import ActionButton from '@/components/ui/ActionButton';
import ModernCard from '@/components/ui/ModernCard';
import GradientBackground from '@/components/ui/GradientBackground';

const TermsPage = () => {
  const navigate = useNavigate();

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
          className="max-w-4xl mx-auto"
        >
          <ModernCard className="p-8" gradient>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
                <p className="text-white/70">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Agreement to Terms</h2>
                <p className="text-white/80 leading-relaxed">
                  By accessing and using Echo, you accept and agree to be bound by the terms and provision of this agreement. 
                  Echo is an AI-powered career guidance platform designed to help users achieve their professional goals.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. Use License</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  Permission is granted to temporarily use Echo for personal, non-commercial transitory viewing only. This includes:
                </p>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li>Receiving personalized career advice and guidance</li>
                  <li>Using our AI-powered resume optimization tools</li>
                  <li>Accessing interview preparation resources</li>
                  <li>Participating in career assessments and skill evaluations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. AI Services Disclaimer</h2>
                <p className="text-white/80 leading-relaxed">
                  Echo provides AI-generated career advice and guidance. While we strive for accuracy and relevance, 
                  AI recommendations should be considered as supplementary guidance rather than definitive career decisions. 
                  Users are encouraged to verify information and consult with professional career counselors when making significant career choices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. User Data and Privacy</h2>
                <p className="text-white/80 leading-relaxed">
                  Your privacy is important to us. Echo collects and processes personal information in accordance with our Privacy Policy. 
                  By using our services, you consent to the collection and use of information as outlined in our privacy practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Prohibited Uses</h2>
                <p className="text-white/80 leading-relaxed mb-4">You may not use Echo for:</p>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li>Any unlawful purpose or to solicit others to perform illegal acts</li>
                  <li>Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>Infringing upon or violating our intellectual property rights or the intellectual property rights of others</li>
                  <li>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Contact Information</h2>
                <p className="text-white/80 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us through our platform's support system 
                  or reach out to our team for assistance.
                </p>
              </section>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </GradientBackground>
  );
};

export default TermsPage;
