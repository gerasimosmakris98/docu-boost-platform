
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProfessionalSummaryCardProps {
  summary: string;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const ProfessionalSummaryCard = ({ summary, isEditing, onChange }: ProfessionalSummaryCardProps) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">Professional Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div>
            <p className="text-gray-300 whitespace-pre-line">
              {summary || 'No professional summary specified.'}
            </p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalSummaryCard;
