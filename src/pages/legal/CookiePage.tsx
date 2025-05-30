
import { motion } from 'framer-motion';
import { ArrowLeft, Cookie } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import ActionButton from '@/components/ui/ActionButton';
import ModernCard from '@/components/ui/ModernCard';
import GradientBackground from '@/components/ui/GradientBackground';

const CookiePage = () => {
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
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <Cookie className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
                <p className="text-white/70">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">1. What Are Cookies</h2>
                <p className="text-white/80 leading-relaxed">
                  Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
                  They help AI Career Advisor provide you with a better experience by remembering your preferences and improving our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Cookies</h2>
                <p className="text-white/80 leading-relaxed mb-4">AI Career Advisor uses cookies for the following purposes:</p>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for basic website functionality and security</li>
                  <li><strong>Authentication Cookies:</strong> To keep you logged in and maintain your session</li>
                  <li><strong>Preference Cookies:</strong> To remember your settings and personalization choices</li>
                  <li><strong>Analytics Cookies:</strong> To understand how you use our platform and improve our services</li>
                  <li><strong>AI Enhancement Cookies:</strong> To help our AI provide more personalized career guidance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. Types of Cookies We Use</h2>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Session Cookies</h3>
                    <p className="text-white/80">Temporary cookies that expire when you close your browser</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Persistent Cookies</h3>
                    <p className="text-white/80">Remain on your device for a set period or until you delete them</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-2">Third-Party Cookies</h3>
                    <p className="text-white/80">Set by external services we use to enhance your experience</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. Managing Your Cookie Preferences</h2>
                <p className="text-white/80 leading-relaxed mb-4">
                  You have control over cookies and can manage them in several ways:
                </p>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li>Use your browser settings to block or delete cookies</li>
                  <li>Set your browser to notify you when cookies are being set</li>
                  <li>Use our cookie preferences center (when available)</li>
                  <li>Opt-out of specific tracking cookies through industry tools</li>
                </ul>
                <p className="text-white/80 leading-relaxed mt-4">
                  Please note that disabling certain cookies may affect the functionality of AI Career Advisor and your user experience.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. AI and Personalization</h2>
                <p className="text-white/80 leading-relaxed">
                  Some cookies help our AI system provide more personalized career advice by remembering your 
                  preferences, career goals, and interaction patterns. This data is processed securely and 
                  helps AI Career Advisor deliver more relevant and useful guidance.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Updates to This Policy</h2>
                <p className="text-white/80 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or 
                  applicable laws. We encourage you to review this policy periodically for any updates.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. Contact Us</h2>
                <p className="text-white/80 leading-relaxed">
                  If you have questions about our use of cookies, please contact us through our platform's 
                  support system or reach out to our team.
                </p>
              </section>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </GradientBackground>
  );
};

export default CookiePage;
