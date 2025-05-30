
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
              <div className="p-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
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
                <p className="text-white/80 leading-relaxed mb-4">
                  Echo collects information you provide directly to us, such as when you:
                </p>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li>Create an account or profile</li>
                  <li>Upload resumes or career documents</li>
                  <li>Engage in conversations with our AI assistant</li>
                  <li>Complete career assessments or surveys</li>
                  <li>Contact us for support</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                <p className="text-white/80 leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li>Provide personalized career guidance and recommendations</li>
                  <li>Improve our AI algorithms and service quality</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Ensure the security and integrity of our platform</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">3. AI and Machine Learning</h2>
                <p className="text-white/80 leading-relaxed">
                  Echo uses artificial intelligence and machine learning technologies to provide career advice. 
                  Your interactions help improve our AI models, but we implement privacy-preserving techniques 
                  to protect your personal information while enhancing service quality.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">4. Data Security</h2>
                <p className="text-white/80 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. This includes 
                  encryption, secure servers, and regular security assessments.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">5. Data Retention</h2>
                <p className="text-white/80 leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services and fulfill 
                  the purposes outlined in this privacy policy, unless a longer retention period is required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
                <p className="text-white/80 leading-relaxed mb-4">You have the right to:</p>
                <ul className="list-disc list-inside text-white/80 space-y-2 ml-4">
                  <li>Access and review your personal information</li>
                  <li>Request corrections to inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt-out of certain data processing activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">7. Contact Us</h2>
                <p className="text-white/80 leading-relaxed">
                  If you have questions about this Privacy Policy or our data practices, 
                  please contact us through our platform's support system.
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
