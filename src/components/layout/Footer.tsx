
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black text-gray-400 py-6 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex flex-col items-center md:items-start gap-2">
            <Logo size="sm" withLink={false} />
            <p className="text-sm">
              © {currentYear} AI Career Advisor. All rights reserved.
            </p>
          </div>
          
          <div className="flex gap-x-4 text-sm">
            <Link to="/legal/terms" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
            <Link to="/legal/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/legal/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
