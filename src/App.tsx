
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LinkedIn from "./pages/LinkedIn";
import Profile from "./pages/Profile";
import Conversations from "./pages/Conversations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/documents" element={<Index />} />
              <Route path="/cover-letters" element={<Index />} />
              <Route path="/assessments" element={<Index />} />
              <Route path="/linkedin" element={<LinkedIn />} />
              <Route path="/guides" element={<Index />} />
              <Route path="/courses" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Index />} />
              {/* New conversation routes */}
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/conversations/:id" element={<Conversations />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
