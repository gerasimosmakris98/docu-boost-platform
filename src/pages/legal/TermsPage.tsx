
import { Helmet } from 'react-helmet-async';
import { ScrollArea } from '@/components/ui/scroll-area';
import LegalNavigation from '@/components/legal/LegalNavigation';
import Logo from '@/components/common/Logo';

const TermsPage = () => {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <Helmet>
        <title>Terms of Use - AI Career Advisor</title>
        <meta name="description" content="Terms of Use for AI Career Advisor - Our policies and guidelines for using the service." />
      </Helmet>
      
      <div className="mb-6">
        <Logo size="md" withLink={true} />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Terms of Use</h1>
      <p className="text-muted-foreground mb-6">Last updated: May 19, 2025</p>
      
      <LegalNavigation />
      
      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AI Career Advisor ("the Service"), you agree to be bound by these Terms of Use. 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p>
              AI Career Advisor provides AI-powered career guidance, resume optimization, interview preparation, 
              and related services through conversational interfaces and document analysis features.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts and Registration</h2>
            <p>
              Some features of the Service require registration. You are responsible for maintaining 
              the confidentiality of your account information and for all activities that occur under your account.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Use of AI Technology</h2>
            <p>
              Our Service utilizes AI technology to generate responses and provide guidance. 
              While we strive for accuracy, we cannot guarantee that all AI-generated advice will be 
              completely accurate, suitable, or effective for your specific situation.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. User Content</h2>
            <p>
              You retain ownership of content you submit to the Service (resumes, cover letters, etc.). 
              By submitting content, you grant us a license to use it for providing and improving the Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Prohibited Uses</h2>
            <p>
              You may not use the Service for any illegal purpose or to violate any laws, 
              attempt to gain unauthorized access to any part of the Service, or interfere with its functionality.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We shall not be liable 
              for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the Service 
              after such modifications constitutes your acceptance of the new terms.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@aicareeradvisor.com.
            </p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default TermsPage;
