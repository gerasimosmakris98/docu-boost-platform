
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LinkedInProfile } from "@/contexts/AuthContext";
import { 
  Award, 
  CheckCircle, 
  Edit, 
  MessageSquare, 
  Star, 
  Zap 
} from "lucide-react";

interface LinkedInOptimizerProps {
  profile: LinkedInProfile | null;
  onCreateDocument: (type: 'resume' | 'cover_letter') => void;
}

const LinkedInOptimizer = ({ profile, onCreateDocument }: LinkedInOptimizerProps) => {
  const [activeTab, setActiveTab] = useState('insights');
  
  if (!profile) {
    return null;
  }
  
  // Calculate profile score strengths and weaknesses
  const strengths = [
    'Strong experience section with detailed descriptions',
    'Good selection of relevant skills',
    profile.skills.length > 5 ? 'Comprehensive skills list' : null,
    profile.summary ? 'Profile includes a summary section' : null,
  ].filter(Boolean);
  
  const weaknesses = [
    !profile.summary || profile.summary.length < 100 ? 'Summary section could be more detailed' : null,
    profile.skills.length < 8 ? 'Add more relevant skills to your profile' : null,
    'Consider adding more achievements with quantifiable results',
    'Add recommendations to strengthen your profile',
  ].filter(Boolean);
  
  return (
    <Card className="w-full">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="p-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Profile Analysis</h3>
            
            <div className="relative pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    Profile Strength
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {profile.profileScore || 75}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div 
                  style={{ width: `${profile.profileScore || 75}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500">
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500" /> Strengths
                </h4>
                <ul className="space-y-1">
                  {strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Zap className="h-4 w-4 text-orange-500" /> Improvement Areas
                </h4>
                <ul className="space-y-1">
                  {weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-1.5">
                      <Edit className="h-3.5 w-3.5 text-blue-500 mt-0.5" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-1.5">
                <Award className="h-5 w-5 text-amber-500" />
                Recommended Improvements
              </h3>
              
              <div className="space-y-3">
                <div className="border rounded-md p-3 bg-blue-50">
                  <h4 className="font-medium">Enhance Your Professional Summary</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Add specific achievements and quantifiable results to make your profile stand out. Focus on how you've contributed to organizational goals.
                  </p>
                  <Button size="sm" className="mt-2" variant="outline">
                    Generate AI Summary
                  </Button>
                </div>
                
                <div className="border rounded-md p-3 bg-blue-50">
                  <h4 className="font-medium">Optimize Skills Section</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Add industry-specific keywords and technical skills relevant to your target roles. Consider removing generic skills that don't add value.
                  </p>
                  <Button size="sm" className="mt-2" variant="outline">
                    Suggest Skills
                  </Button>
                </div>
                
                <div className="border rounded-md p-3 bg-blue-50">
                  <h4 className="font-medium">Enhance Job Descriptions</h4>
                  <p className="text-sm text-gray-700 mt-1">
                    Use action verbs and include specific metrics to demonstrate your impact. Highlight how you solved problems and delivered results.
                  </p>
                  <Button size="sm" className="mt-2" variant="outline">
                    Improve Descriptions
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="documents" className="p-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-1.5">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Create Documents
            </h3>
            
            <p className="text-sm text-gray-600">
              Use your LinkedIn profile data to quickly generate professional documents.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div className="border rounded-md p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-medium">Resume/CV</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Create a professional resume based on your LinkedIn profile data.
                </p>
                <Button 
                  className="mt-3 w-full" 
                  onClick={() => onCreateDocument('resume')}
                >
                  Generate Resume
                </Button>
              </div>
              
              <div className="border rounded-md p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-medium">Cover Letter</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Draft a personalized cover letter using your experience and skills.
                </p>
                <Button 
                  className="mt-3 w-full" 
                  onClick={() => onCreateDocument('cover_letter')}
                >
                  Create Cover Letter
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default LinkedInOptimizer;
