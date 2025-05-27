
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { lazy, Suspense } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CookieConsent from '@/components/legal/CookieConsent';

// Eager loaded pages
import AuthPage from '@/pages/AuthPage';
import ChatPage from '@/pages/ChatPage';
import HomePage from '@/pages/HomePage';
import NotFound from '@/pages/NotFound';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NewChat from '@/pages/NewChat';
import Index from '@/pages/Index';
import Conversations from '@/pages/Conversations';
import LinkedIn from '@/pages/LinkedIn';

// Lazy loaded pages for better performance
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'));
const CookiePage = lazy(() => import('@/pages/legal/CookiePage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-black">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Dashboard/Home Route */}
                <Route path="/" element={<Index />} />
                
                {/* Auth routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                
                {/* Protected routes */}
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute fallback={<Navigate to="/auth" replace />}>
                      <ChatPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat/:id" 
                  element={
                    <ProtectedRoute fallback={<Navigate to="/auth" replace />}>
                      <ChatPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/new-chat" 
                  element={
                    <ProtectedRoute fallback={<Navigate to="/auth" replace />}>
                      <NewChat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/conversations" 
                  element={
                    <ProtectedRoute fallback={<Navigate to="/auth" replace />}>
                      <Conversations />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/linkedin" 
                  element={
                    <ProtectedRoute fallback={<Navigate to="/auth" replace />}>
                      <LinkedIn />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute fallback={<Navigate to="/auth" replace />}>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Legal Pages */}
                <Route path="/legal/terms" element={<TermsPage />} />
                <Route path="/legal/privacy" element={<PrivacyPage />} />
                <Route path="/legal/cookies" element={<CookiePage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            
            <CookieConsent />
            <Toaster />
            <SonnerToaster 
              position="top-right" 
              closeButton
              richColors
              expand
              toastOptions={{
                className: 'bg-gray-900 text-white border border-gray-800 shadow-lg',
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  border: 'hsl(var(--border))'
                }
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
