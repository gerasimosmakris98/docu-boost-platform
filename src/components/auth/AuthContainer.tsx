
import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface AuthContainerProps {
  title: string;
  description: string;
  content: ReactNode;
  footer?: ReactNode;
}

const AuthContainer = ({ title, description, content, footer }: AuthContainerProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="bg-black/70 border border-gray-800 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">{title}</CardTitle>
            <CardDescription className="text-center text-gray-400">{description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {content}
          </CardContent>
          
          {footer && (
            <CardFooter className="flex flex-col border-t border-gray-800 pt-6">
              {footer}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AuthContainer;
