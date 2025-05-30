
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import WelcomePage from "./pages/WelcomePage";
import "./App.css";
import EnhancedChatPage from "./pages/EnhancedChatPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TermsPage from "./pages/legal/TermsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import CookiePage from "./pages/legal/CookiePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <TooltipProvider>
              <AuthProvider>
                <BrowserRouter>
                  <Helmet>
                    <title>AI Career Advisor - Your Intelligent Career Companion</title>
                    <meta name="description" content="Meet AI Career Advisor, your intelligent career companion. Get personalized career advice, resume optimization, interview preparation, and job search strategies powered by advanced artificial intelligence." />
                    <meta name="keywords" content="AI Career Advisor, career guidance, resume optimization, interview preparation, job search, artificial intelligence" />
                    <meta property="og:title" content="AI Career Advisor - Your Intelligent Career Companion" />
                    <meta property="og:description" content="Transform your career with AI Career Advisor, the intelligent assistant that provides personalized guidance and support." />
                    <meta property="og:type" content="website" />
                  </Helmet>
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/chat" element={<EnhancedChatPage />} />
                    <Route path="/chat/:id" element={<EnhancedChatPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/cookies" element={<CookiePage />} />
                    <Route path="*" element={<WelcomePage />} />
                  </Routes>
                </BrowserRouter>
              </AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
