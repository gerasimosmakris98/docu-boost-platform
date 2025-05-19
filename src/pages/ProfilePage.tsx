
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Mail, 
  Calendar, 
  LogOut,
  ArrowLeft,
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate("/auth");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }
  
  const joinedDate = user.created_at || new Date().toISOString();
  const joinedTimeAgo = formatDistanceToNow(new Date(joinedDate), { addSuffix: true });
  
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6 pl-0 text-gray-400 hover:text-white"
          onClick={() => navigate("/chat")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Button>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                User Profile
              </div>
            </CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16 border-2 border-green-500/20">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-green-700 text-xl">
                  {(user.email || 'U').substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-medium text-lg">
                  {user.user_metadata?.full_name || 'User'}
                </h3>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Email:</span>
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Joined:</span>
                <span>{joinedTimeAgo}</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
