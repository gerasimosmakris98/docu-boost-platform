
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">{title}</CardTitle>
            <CardDescription className="text-center">{description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {content}
          </CardContent>
          
          {footer && (
            <CardFooter className="flex flex-col">
              {footer}
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AuthContainer;
