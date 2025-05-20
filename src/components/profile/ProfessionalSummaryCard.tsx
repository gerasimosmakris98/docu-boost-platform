
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, EditIcon, Loader2 } from "lucide-react";

interface ProfessionalSummaryCardProps {
  summary: string;
  isEditing: boolean;
  isLoading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setIsEditing: (editing: boolean) => void;
  onSave: () => void;
}

const ProfessionalSummaryCard = ({ 
  summary, 
  isEditing, 
  isLoading = false,
  onChange,
  setIsEditing,
  onSave
}: ProfessionalSummaryCardProps) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Professional Summary</CardTitle>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {!isEditing ? (
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
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={onSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalSummaryCard;
