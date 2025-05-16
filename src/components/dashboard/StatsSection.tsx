
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mail, BrainCircuit, Briefcase } from "lucide-react";

const StatsSection = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="animate-fadeIn" style={{ animationDelay: "0ms" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">
            +3 from last month
          </p>
        </CardContent>
      </Card>
      <Card className="animate-fadeIn" style={{ animationDelay: "100ms" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cover Letters</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">7</div>
          <p className="text-xs text-muted-foreground">
            +2 from last month
          </p>
        </CardContent>
      </Card>
      <Card className="animate-fadeIn" style={{ animationDelay: "200ms" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assessments</CardTitle>
          <BrainCircuit className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4</div>
          <p className="text-xs text-muted-foreground">
            +1 from last month
          </p>
        </CardContent>
      </Card>
      <Card className="animate-fadeIn" style={{ animationDelay: "300ms" }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">78%</div>
          <p className="text-xs text-muted-foreground">
            +12% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSection;
