
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { conversationService } from "@/services/conversationService";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setName(user.user_metadata?.full_name || "");
    }
  }, [user]);
  
  const handleLogout = async () => {
    await logout();
    navigate("/auth");
    toast.success("Logged out successfully");
  };
  
  const handleCreateNewChat = async () => {
    try {
      toast.loading("Creating new conversation...");
      const newConversation = await conversationService.createSpecializedConversation('general');
      
      if (newConversation) {
        navigate(`/chat/${newConversation.id}`);
        toast.dismiss();
        toast.success("New conversation created");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    }
  };
  
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-full max-w-xs">
        <ChatSidebar 
          onNewChat={handleCreateNewChat}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-gray-950">
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              asChild
              className="mb-4"
            >
              <Link to="/" className="flex items-center text-gray-400 hover:text-white">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Chat
              </Link>
            </Button>
            
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>
          
          <Card className="bg-gray-900 border-gray-800 shadow-lg mb-6">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="bg-green-700 text-xl">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-medium">{name || "User"}</h3>
                  <p className="text-sm text-gray-400">{email}</p>
                </div>
              </div>
              
              <Separator className="bg-gray-800" />
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="bg-gray-800 border-gray-700"
                      readOnly
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={email} 
                      className="bg-gray-800 border-gray-700"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
