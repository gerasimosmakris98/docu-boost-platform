
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BrainCircuit, LineChart, PieChart, BarChart } from "lucide-react";

const AssessmentSection = () => {
  const assessments = [
    {
      id: "1",
      title: "Technical Skills",
      progress: 78,
      icon: BrainCircuit,
      color: "bg-blue-500",
    },
    {
      id: "2",
      title: "Communication",
      progress: 62,
      icon: LineChart,
      color: "bg-emerald-500",
    },
    {
      id: "3",
      title: "Leadership",
      progress: 45,
      icon: PieChart,
      color: "bg-purple-500",
    },
    {
      id: "4",
      title: "Problem Solving",
      progress: 85,
      icon: BarChart,
      color: "bg-amber-500",
    },
  ];

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
              <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-primary">
                Continue Assessment
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AssessmentSection;
