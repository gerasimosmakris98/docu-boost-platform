
import { Helmet } from 'react-helmet-async';
import UnifiedLayout from '@/components/layout/UnifiedLayout';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Use - AI Career Advisor</title>
        <meta name="description" content="Terms of Use for AI Career Advisor" />
      </Helmet>
      
      <UnifiedLayout showFooter={true}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Terms of Use
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using AI Career Advisor, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Use License</h2>
              <p className="text-gray-300 leading-relaxed">
                Permission is granted to temporarily use AI Career Advisor for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Disclaimer</h2>
              <p className="text-gray-300 leading-relaxed">
                The materials on AI Career Advisor are provided on an 'as is' basis. AI Career Advisor makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. AI-Generated Content</h2>
              <p className="text-gray-300 leading-relaxed">
                AI Career Advisor provides AI-generated career advice and content. While we strive for accuracy, all advice should be considered as suggestions and not professional career counseling. Users should verify information and make their own informed decisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. User Data</h2>
              <p className="text-gray-300 leading-relaxed">
                We respect your privacy and handle your data according to our Privacy Policy. By using our service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Limitations</h2>
              <p className="text-gray-300 leading-relaxed">
                In no event shall AI Career Advisor or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use AI Career Advisor.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Use, please contact us through our support channels.
              </p>
            </section>
          </div>
        </div>
      </UnifiedLayout>
    </>
  );
};

export default TermsPage;
