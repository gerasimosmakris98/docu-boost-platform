
import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const LegalNavigation: FC = () => {
  const { pathname } = useLocation();
  
  return (
    <div className="my-4">
      <div className="flex space-x-4 mb-4">
        <Link 
          to="/legal/terms" 
          className={cn(
            "text-sm font-medium transition-colors",
            pathname === '/legal/terms' 
              ? "text-primary" 
              : "text-muted-foreground hover:text-primary"
          )}
        >
          Terms of Use
        </Link>
        <Link 
          to="/legal/privacy" 
          className={cn(
            "text-sm font-medium transition-colors",
            pathname === '/legal/privacy' 
              ? "text-primary" 
              : "text-muted-foreground hover:text-primary"
          )}
        >
          Privacy Policy
        </Link>
        <Link 
          to="/legal/cookies" 
          className={cn(
            "text-sm font-medium transition-colors",
            pathname === '/legal/cookies' 
              ? "text-primary" 
              : "text-muted-foreground hover:text-primary"
          )}
        >
          Cookie Policy
        </Link>
      </div>
      <Separator className="mb-4" />
    </div>
  );
};

export default LegalNavigation;
