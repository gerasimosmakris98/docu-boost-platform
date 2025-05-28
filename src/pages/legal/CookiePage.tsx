
import { Helmet } from 'react-helmet-async';
import UnifiedLayout from '@/components/layout/UnifiedLayout';

const CookiePage = () => {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - AI Career Advisor</title>
        <meta name="description" content="Cookie Policy for AI Career Advisor" />
      </Helmet>
      
      <UnifiedLayout showFooter={true}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Cookie Policy
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. What Are Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and improving our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies to maintain your login session, remember your preferences, analyze website traffic, and improve our AI career advisory services. This helps us provide personalized career advice and maintain service quality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Types of Cookies We Use</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3"><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and session management.</p>
                <p className="mb-3"><strong>Analytics Cookies:</strong> Help us understand how users interact with our AI career tools to improve our services.</p>
                <p className="mb-3"><strong>Preference Cookies:</strong> Remember your settings and preferences for a personalized experience.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Managing Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                You can control and manage cookies through your browser settings. However, disabling certain cookies may limit your ability to use some features of our AI career advisory platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Third-Party Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                We may use third-party services that set cookies to help us analyze usage patterns and improve our AI services. These third parties have their own privacy policies governing their use of cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Updates to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Cookie Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about our use of cookies, please contact us through our support channels.
              </p>
            </section>
          </div>
        </div>
      </UnifiedLayout>
    </>
  );
};

export default CookiePage;
