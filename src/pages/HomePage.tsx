
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Plus, User, LogIn } from "lucide-react";
import { toast } from "sonner";
import { conversationService } from "@/services/conversationService";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    try {
      toast.loading('Starting new chat...');
      const conversation = await conversationService.createSpecializedConversation('general');
      
      if (conversation) {
        toast.dismiss();
        navigate(`/chat/${conversation.id}`);
      } else {
        toast.error('Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  const handleViewChats = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-green-500" />
            <h1 className="text-xl font-bold">AI Chat</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button onClick={handleViewChats}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  My Chats
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">AI Chat Assistant</h2>
          <p className="text-xl text-gray-400 mb-8">
            Chat with AI, save your conversations, and get intelligent responses.
          </p>

          <div className="grid gap-4 max-w-md mx-auto">
            <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer" onClick={handleStartChat}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3">
                  <Plus className="h-6 w-6 text-green-500" />
                  <span className="text-lg font-semibold">Start New Chat</span>
                </div>
              </CardContent>
            </Card>

            {isAuthenticated && (
              <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer" onClick={handleViewChats}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                    <span className="text-lg font-semibold">View My Chats</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-gray-500 mt-6">
              <Button variant="link" onClick={() => navigate('/auth')}>
                Sign in
              </Button> 
              to save your conversations
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
