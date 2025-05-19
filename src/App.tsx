
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import UserProfile from '@/pages/UserProfile';
import LinkedIn from '@/pages/LinkedIn';
import Conversations from '@/pages/Conversations';
import ConversationDetail from '@/pages/ConversationDetail';
import NewChat from '@/pages/NewChat';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/linkedin" element={<ProtectedRoute><LinkedIn /></ProtectedRoute>} />
            <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
            <Route path="/conversations/:id" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
            <Route path="/chat/:id" element={<ProtectedRoute><ConversationDetail /></ProtectedRoute>} />
            <Route path="/chat/new" element={<ProtectedRoute><NewChat /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
