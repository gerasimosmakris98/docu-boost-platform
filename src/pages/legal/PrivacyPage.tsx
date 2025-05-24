
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-white hover:text-green-400">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Information Sharing</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our support channels.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
