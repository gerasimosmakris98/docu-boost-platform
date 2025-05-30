
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import ActionButton from '@/components/ui/ActionButton';
import ModernCard from '@/components/ui/ModernCard';
import GradientBackground from '@/components/ui/GradientBackground';

const PrivacyPage = () => {
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
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                <p className="text-white/70">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
                <p className="text-white/80 leading-relaxed">
                  AI Career Advisor collects information you provide directly to us, such as when you create an account, 
                  use our services, or contact us for support. This may include your name, email address, career information, 
                  and any content you share with our AI system.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                <p className="text-white/80 leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li>Provide personalized career advice and recommendations</li>
                  <li>Improve our AI algorithms and service quality</li>
                  <li>Communicate with you about our services</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. Data Security</h2>
                <p className="text-white/80 leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted in transit 
                  and at rest using industry-standard encryption protocols.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. AI Data Processing</h2>
                <p className="text-white/80 leading-relaxed">
                  Our AI system processes your career-related information to provide personalized advice. This processing 
                  is performed securely and your data is never shared with third parties for commercial purposes. 
                  You can request deletion of your data at any time.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Your Rights</h2>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Access & Portability</h3>
                    <p className="text-white/80">Request a copy of your personal data in a portable format</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Correction</h3>
                    <p className="text-white/80">Update or correct inaccurate personal information</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Deletion</h3>
                    <p className="text-white/80">Request deletion of your personal data</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Contact Us</h2>
                <p className="text-white/80 leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, please contact us through 
                  our platform's support system or reach out to our privacy team.
                </p>
              </section>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </GradientBackground>
  );
};

export default PrivacyPage;
