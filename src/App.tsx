
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Pages
import AuthPage from '@/pages/AuthPage';
import ChatPage from '@/pages/ChatPage';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';

// Auth state cleanup utility
import { cleanupAuthState } from '@/services/authService';

function App() {
  // Clean up any existing auth state on app initialization
  cleanupAuthState();
  
  return (
    <ThemeProvider defaultTheme="dark">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <SonnerToaster 
            position="top-right" 
            toastOptions={{
              className: 'bg-gray-900 text-white border border-gray-800',
              duration: 3000
            }}
          />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
