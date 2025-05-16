
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, LineChart, PieChart, BarChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AssessmentQuiz from "@/components/assessment/AssessmentQuiz";
import { 
  technicalAssessment, 
  communicationAssessment, 
  leadershipAssessment, 
  problemSolvingAssessment 
} from "@/data/mockAssessments";

const AssessmentSection = () => {
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  const assessments = [
    {
      id: "technical",
      title: "Technical Skills",
      progress: 78,
      icon: BrainCircuit,
      color: "bg-blue-500",
      data: technicalAssessment
    },
    {
      id: "communication",
      title: "Communication",
      progress: 62,
      icon: LineChart,
      color: "bg-emerald-500",
      data: communicationAssessment
    },
    {
      id: "leadership",
      title: "Leadership",
      progress: 45,
      icon: PieChart,
      color: "bg-purple-500",
      data: leadershipAssessment
    },
    {
      id: "problem-solving",
      title: "Problem Solving",
      progress: 85,
      icon: BarChart,
      color: "bg-amber-500",
      data: problemSolvingAssessment
    },
  ];

  const startAssessment = (assessment: any) => {
    setSelectedAssessment(assessment);
    setAssessmentOpen(true);
  };

  const handleCompleteAssessment = (results: any) => {
    console.log("Assessment results:", results);
    // In a real app, you would store these results
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Assessments</h2>
        <Button variant="ghost" size="sm" className="gap-1 text-primary">
          View All
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {assessments.map((assessment, index) => (
          <Card key={assessment.id} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{assessment.title}</CardTitle>
              <div className={`p-1.5 rounded-full ${assessment.color}`}>
                <assessment.icon className="h-3.5 w-3.5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-2xl font-bold">{assessment.progress}%</div>
              <Progress 
                value={assessment.progress} 
                className="h-2 mt-2" 
              />
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-auto text-xs text-primary"
                onClick={() => startAssessment(assessment)}
              >
                Continue Assessment
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={assessmentOpen} onOpenChange={setAssessmentOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedAssessment?.data.title}</DialogTitle>
            <DialogDescription>
              {selectedAssessment?.data.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAssessment && (
            <AssessmentQuiz
              title={selectedAssessment.data.title}
              description={selectedAssessment.data.description}
              questions={selectedAssessment.data.questions}
              timeLimit={selectedAssessment.data.timeLimit}
              onComplete={handleCompleteAssessment}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentSection;
