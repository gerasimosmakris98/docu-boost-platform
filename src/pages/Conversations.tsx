
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FilePlus, MessageSquare, FileText, PenBox, User, Plus, 
  Trash2, Calendar, MoreVertical, ArrowLeft 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import LoginDialog from "@/components/auth/LoginDialog";
import { 
  Conversation, 
  ConversationType, 
  conversationService 
} from "@/services/conversationService";
import ConversationChat from "@/components/conversation/ConversationChat";

const Conversations = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, profile } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>(id ? "chat" : "list");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setCurrentTab(id ? "chat" : "list");
  }, [id]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleCreateConversation = async (type: ConversationType) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    try {
      setCreating(true);
      let title = "";
      
      switch (type) {
        case "resume":
          title = "Resume Builder";
          break;
        case "cover_letter":
          title = "Cover Letter Assistant";
          break;
        case "interview_prep":
          title = "Interview Preparation";
          break;
        default:
          title = "New Conversation";
      }
      
      const newConversation = await conversationService.createConversation(title, type);
      
      if (newConversation) {
        toast.success("Conversation created");
        await fetchConversations();
        navigate(`/conversations/${newConversation.id}`);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const success = await conversationService.deleteConversation(id);
      
      if (success) {
        toast.success("Conversation deleted");
        await fetchConversations();
        
        // If we're currently viewing the deleted conversation, go back to the list
        if (window.location.pathname.includes(id)) {
          navigate("/conversations");
        }
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  // Function to get icon based on conversation type
  const getConversationIcon = (type: ConversationType) => {
    switch (type) {
      case "resume":
        return <FileText className="h-5 w-5" />;
      case "cover_letter":
        return <PenBox className="h-5 w-5" />;
      case "interview_prep":
        return <User className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      {!isAuthenticated ? (
        <div className="mb-6 p-6 bg-muted/50 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in to access conversations</h2>
          <p className="text-muted-foreground mb-4">
            Create an account or sign in to start new conversations and access your existing ones
          </p>
          <Button onClick={handleLogin}>Sign In</Button>
          <LoginDialog
            isOpen={loginDialogOpen}
            onClose={() => setLoginDialogOpen(false)}
          />
        </div>
      ) : null}

      <div className="space-y-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger 
              value="list" 
              onClick={() => navigate("/conversations")}
            >
              Conversations
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              disabled={!id}
            >
              Current Chat
            </TabsTrigger>
          </TabsList>
          
          {/* Conversations List Tab */}
          <TabsContent value="list" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Your Conversations</h2>
              <Button onClick={() => handleCreateConversation("general")} disabled={creating || !isAuthenticated}>
                <Plus className="mr-2 h-4 w-4" /> New Conversation
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Resume Builder Card */}
              <Card className="border border-blue-200 hover:border-blue-300 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div 
                    className="flex flex-col items-center justify-center h-full space-y-4" 
                    onClick={() => handleCreateConversation("resume")}
                  >
                    <div className="p-3 rounded-full bg-blue-100">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Resume Builder</h3>
                    <p className="text-center text-gray-500 text-sm">
                      Create and customize your professional resume with AI guidance
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Cover Letter Assistant Card */}
              <Card className="border border-green-200 hover:border-green-300 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div 
                    className="flex flex-col items-center justify-center h-full space-y-4"
                    onClick={() => handleCreateConversation("cover_letter")}
                  >
                    <div className="p-3 rounded-full bg-green-100">
                      <PenBox className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Cover Letter Assistant</h3>
                    <p className="text-center text-gray-500 text-sm">
                      Create tailored cover letters for specific job positions
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Interview Preparation Card */}
              <Card className="border border-purple-200 hover:border-purple-300 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div 
                    className="flex flex-col items-center justify-center h-full space-y-4"
                    onClick={() => handleCreateConversation("interview_prep")}
                  >
                    <div className="p-3 rounded-full bg-purple-100">
                      <User className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Interview Preparation</h3>
                    <p className="text-center text-gray-500 text-sm">
                      Practice for interviews with AI-generated questions and feedback
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Conversations */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Conversations</h3>
              {loading ? (
                <div className="text-center py-8">Loading your conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  You have no conversations yet. Start a new one!
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <Link 
                        to={`/conversations/${conversation.id}`} 
                        className="flex items-center flex-1"
                      >
                        <div className="p-2 rounded-full bg-gray-100 mr-3">
                          {getConversationIcon(conversation.type)}
                        </div>
                        <div>
                          <h4 className="font-medium">{conversation.title}</h4>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Current Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            {id && (
              <div className="flex items-center mb-4">
                <Button variant="ghost" onClick={() => navigate("/conversations")} className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back to Conversations
                </Button>
              </div>
            )}
            {id && <ConversationChat conversationId={id} />}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Conversations;
