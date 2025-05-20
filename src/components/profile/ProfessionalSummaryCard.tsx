
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, EditIcon, Loader2 } from "lucide-react";

interface ProfessionalSummaryCardProps {
  summary: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ProfessionalSummaryCard = ({ summary, isEditing, onChange }: ProfessionalSummaryCardProps) => {
  const [isEditMode, setIsEditMode] = useState(isEditing);
  
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Professional Summary</CardTitle>
        {!isEditMode && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditMode(true)}
            className="text-gray-400 hover:text-white"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!isEditMode ? (
          <div>
            <p className="text-gray-300 whitespace-pre-line">
              {summary || 'No professional summary specified.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea 
                id="summary" 
                name="summary" 
                value={summary} 
                onChange={onChange} 
                rows={6}
                placeholder="Write a brief professional summary highlighting your expertise and career objectives..."
                className="resize-none bg-gray-800/50 border-gray-700"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditMode(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  // Handle save functionality here
                  setIsEditMode(false);
                }}
              >
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalSummaryCard;
