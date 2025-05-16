
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ProfileSummaryProps {
  summary: string;
  onSave: () => void;
}

const ProfileSummary = ({ summary, onSave }: ProfileSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          className="min-h-[120px]" 
          placeholder="Write a professional summary..."
          defaultValue={summary}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={onSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSummary;
