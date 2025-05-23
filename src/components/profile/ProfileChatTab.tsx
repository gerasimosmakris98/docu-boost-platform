
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth/useAuth";
import { advisors } from "@/components/chat/advisorData";
import { conversationService } from "@/services/conversationService";
import { ConversationType } from "@/services/types/conversationTypes";
import { toast } from "sonner";

const ProfileChatTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  const handleStartChat = async (advisorType: string) => {
    try {
      setIsCreating(true);
      // Cast the string to ConversationType to fix the type error
      const conversation = await conversationService.createSpecializedConversation(advisorType as ConversationType);
      if (conversation) {
        navigate(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackToChat = () => {
    navigate("/chat");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="pl-0 text-gray-400 hover:text-white"
          onClick={handleBackToChat}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Button>
        
        {/* Added X button for more obvious closing */}
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-400 hover:text-white"
          onClick={handleBackToChat}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Chat with AI Advisors</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            Select an advisor to start a personalized conversation based on your profile information.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advisors.map((advisor) => (
              <Card key={advisor.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800 transition cursor-pointer" onClick={() => handleStartChat(advisor.type)}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-700/50 rounded-full p-2">
                      {advisor.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{advisor.name}</h3>
                      <p className="text-sm text-gray-400">{advisor.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">Recent Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">
            Your recent chat sessions will appear here. Start a new conversation with an advisor above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileChatTab;
