
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileSummaryProps {
  summary: string;
  onSave: (updates: any) => void;
}

const ProfileSummary = ({ summary, onSave }: ProfileSummaryProps) => {
  const { isAuthenticated } = useAuth();
  const [summaryText, setSummaryText] = useState(summary);
  
  const handleSave = () => {
    onSave({ summary: summaryText });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          className="min-h-[120px]" 
          placeholder="Write a professional summary..."
          value={summaryText}
          onChange={(e) => setSummaryText(e.target.value)}
          disabled={!isAuthenticated}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={!isAuthenticated}>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSummary;
