
import { Helmet } from 'react-helmet-async';
import { ScrollArea } from '@/components/ui/scroll-area';
import LegalNavigation from '@/components/legal/LegalNavigation';

const PrivacyPage = () => {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <Helmet>
        <title>Privacy Policy - AI Career Advisor</title>
        <meta name="description" content="Privacy Policy for AI Career Advisor - Learn how we handle your personal information." />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: May 19, 2025</p>
      
      <LegalNavigation />
      
      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including personal information such as 
              name, email address, and career-related documents you upload. We also collect usage data, 
              including interactions with our AI systems.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve our services, personalize your experience, 
              communicate with you, and analyze usage patterns to enhance our AI capabilities.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share information with service providers who help us 
              deliver our services, comply with legal obligations, or protect our rights and safety.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. AI Training</h2>
            <p>
              Our AI systems are powered by Perplexity. Your conversations may be used to improve the AI system's 
              performance and capabilities, but are subject to privacy protections and anonymization where appropriate.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of electronic 
              transmission or storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, delete, or restrict the processing of 
              your personal information. You may also have the right to data portability and to withdraw consent.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@aicareeradvisor.com.
            </p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default PrivacyPage;
