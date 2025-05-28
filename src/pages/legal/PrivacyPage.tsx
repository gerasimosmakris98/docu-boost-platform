
import { Helmet } from 'react-helmet-async';
import UnifiedLayout from '@/components/layout/UnifiedLayout';

const PrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - AI Career Advisor</title>
        <meta name="description" content="Privacy Policy for AI Career Advisor" />
      </Helmet>
      
      <UnifiedLayout showFooter={true}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
              <p className="text-gray-300 leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, use our AI career services, or contact us for support. This may include your name, email address, career information, and conversation data with our AI assistants.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed">
                We use the information we collect to provide, maintain, and improve our AI career advisory services, personalize your experience, and communicate with you about your account and our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. AI Processing</h2>
              <p className="text-gray-300 leading-relaxed">
                Your career-related queries and documents may be processed by our AI systems to provide personalized advice. We implement appropriate safeguards to protect your data during AI processing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Data Retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Your Rights</h2>
              <p className="text-gray-300 leading-relaxed">
                You have the right to access, update, or delete your personal information. You can also opt out of certain communications and request a copy of your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through our support channels.
              </p>
            </section>
          </div>
        </div>
      </UnifiedLayout>
    </>
  );
};

export default PrivacyPage;
