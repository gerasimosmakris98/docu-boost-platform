
import AuthContainer from "@/components/auth/AuthContainer";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ResetPasswordPage = () => {
  const [isValidResetLink, setIsValidResetLink] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkResetSession = async () => {
      // Check for a 'type=recovery' query parameter in the URL
      const url = new URL(window.location.href);
      const type = url.searchParams.get('type');
      
      if (type === 'recovery') {
        setIsValidResetLink(true);
      } else {
        // Also check if user session exists to handle direct navigations
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setIsValidResetLink(true);
        } else {
          setIsValidResetLink(false);
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate("/auth", { replace: true });
          }, 1500);
        }
      }
      
      setIsChecking(false);
    };
    
    checkResetSession();
  }, [navigate]);
  
  if (isChecking) {
    return (
      <AuthContainer
        title="Verifying Reset Link"
        description="Please wait while we verify your password reset link..."
        content={
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        }
      />
    );
  }
  
  if (!isValidResetLink) {
    return (
      <AuthContainer
        title="Invalid Reset Link"
        description="This password reset link is invalid or has expired. Redirecting you to the login page..."
        content={
          <div className="text-center py-4">
            <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md">
              Please request a new password reset from the login page.
            </div>
          </div>
        }
      />
    );
  }
  
  return (
    <AuthContainer
      title="Reset Your Password"
      description="Enter your new password below"
      content={<ResetPasswordForm />}
    />
  );
};

export default ResetPasswordPage;
