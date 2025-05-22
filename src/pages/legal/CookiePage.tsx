
import { Helmet } from 'react-helmet-async';
import { ScrollArea } from '@/components/ui/scroll-area';
import LegalNavigation from '@/components/legal/LegalNavigation';
import Logo from '@/components/common/Logo';

const CookiePage = () => {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <Helmet>
        <title>Cookie Policy - AI Career Advisor</title>
        <meta name="description" content="Cookie Policy for AI Career Advisor - Learn how we use cookies and similar technologies." />
      </Helmet>
      
      <div className="mb-6">
        <Logo size="md" withLink={true} />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: May 19, 2025</p>
      
      <LegalNavigation />
      
      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are stored on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to the website owners.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Cookies</h2>
            <p>
              We use cookies for various purposes, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Authentication and security</li>
              <li>Remembering your preferences</li>
              <li>Analyzing how our website is used</li>
              <li>Personalizing your experience</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Types of Cookies We Use</h2>
            <p>
              <strong>Essential cookies:</strong> These are necessary for the website to function properly and cannot be disabled.
            </p>
            <p className="mt-2">
              <strong>Preference cookies:</strong> These remember your settings and preferences.
            </p>
            <p className="mt-2">
              <strong>Analytics cookies:</strong> These help us understand how visitors interact with our website.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third parties on our behalf. These third parties may include analytics 
              providers that help us understand how our website is being used.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Managing Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings. You can typically delete 
              existing cookies and set your browser to prevent new cookies from being set. However, if you disable 
              certain cookies, some features of our website may not function properly.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Changes to This Cookie Policy</h2>
            <p>
              We may update our Cookie Policy from time to time. Any changes will be posted on this page with an 
              updated "Last updated" date.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
            <p>
              If you have any questions about our Cookie Policy, please contact us at privacy@aicareeradvisor.com.
            </p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CookiePage;
