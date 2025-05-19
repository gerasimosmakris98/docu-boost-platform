
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'ai-career-advisor-cookie-consent';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsent) {
      // Show the consent banner after a short delay
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'all');
    setShowConsent(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg md:flex md:items-center md:justify-between"
        >
          <div className="mb-4 md:mb-0 pr-8">
            <div className="flex items-start">
              <div>
                <h3 className="font-bold text-lg">Cookie Consent</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We use cookies to enhance your experience. By continuing to use this site, you agree to our use of cookies.{' '}
                  <Link to="/legal/cookies" className="underline hover:text-primary">
                    Learn more
                  </Link>
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto md:hidden"
                onClick={acceptEssential}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant="outline" onClick={acceptEssential}>
              Essential Only
            </Button>
            <Button onClick={acceptAll}>
              Accept All
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
