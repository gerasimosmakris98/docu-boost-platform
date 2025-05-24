
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';

const CookiePage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <Link to="/">
            <Button variant="ghost" className="text-white hover:text-green-400">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Cookie Policy
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">What Are Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies to remember your preferences, authenticate your sessions, and analyze how you use our service to improve your experience.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Types of Cookies We Use</h2>
            <ul className="text-gray-300 leading-relaxed list-disc pl-6">
              <li>Essential cookies: Required for the website to function properly</li>
              <li>Preference cookies: Remember your settings and preferences</li>
              <li>Analytics cookies: Help us understand how you use our website</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Managing Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about our use of cookies, please contact us through our support channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePage;
