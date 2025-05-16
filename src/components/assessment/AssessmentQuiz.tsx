
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Timer, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  answers: {
    questionId: string;
    selectedOptionId: string;
    correct: boolean;
  }[];
}

interface AssessmentQuizProps {
  title: string;
  description?: string;
  questions: Question[];
  timeLimit?: number; // in seconds
  onComplete?: (results: QuizResults) => void;
}

const AssessmentQuiz = ({
  title,
  description,
  questions,
  timeLimit = 0, // 0 means no time limit
  onComplete,
}: AssessmentQuizProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [results, setResults] = useState<QuizResults | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  useEffect(() => {
    let timer: number | undefined;
    
    if (quizStarted && !quizCompleted) {
      // Track time taken
      timer = window.setInterval(() => {
        setTimeTaken(prev => prev + 1);
        
        // If there's a time limit, count down
        if (timeLimit > 0) {
          setTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              handleComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, quizCompleted, timeLimit]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    toast.info(`Assessment started: ${title}`);
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const quizResults: QuizResults = {
      totalQuestions: questions.length,
      correctAnswers: 0,
      timeTaken,
      answers: []
    };
    
    // Calculate results
    questions.forEach(question => {
      const selectedOptionId = answers[question.id];
      const correct = selectedOptionId === question.correctOptionId;
      
      quizResults.answers.push({
        questionId: question.id,
        selectedOptionId: selectedOptionId || '',
        correct: correct
      });
      
      if (correct) quizResults.correctAnswers++;
    });
    
    setResults(quizResults);
    setQuizCompleted(true);
    
    if (onComplete) {
      onComplete(quizResults);
    }
    
    toast.success(`Assessment completed: ${quizResults.correctAnswers} out of ${quizResults.totalQuestions} correct`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!quizStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>This assessment contains {questions.length} questions.</p>
            {timeLimit > 0 && (
              <p>You will have {formatTime(timeLimit)} to complete it.</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartQuiz} className="w-full">Start Assessment</Button>
        </CardFooter>
      </Card>
    );
  }

  if (quizCompleted && results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
          <CardDescription>
            You completed the assessment in {formatTime(results.timeTaken)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Score</p>
            <p className="text-xl font-bold">
              {results.correctAnswers} / {results.totalQuestions}
              <span className="ml-2 text-lg">
                ({Math.round((results.correctAnswers / results.totalQuestions) * 100)}%)
              </span>
            </p>
          </div>
          
          <Progress value={(results.correctAnswers / results.totalQuestions) * 100} />
          
          <div className="space-y-4 mt-6">
            <h3 className="font-medium">Question Summary</h3>
            {results.answers.map((answer, index) => {
              const question = questions.find(q => q.id === answer.questionId);
              return (
                <div key={answer.questionId} className="border rounded-md p-3">
                  <div className="flex items-start gap-2">
                    {answer.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">Question {index + 1}</p>
                      <p className="text-sm text-gray-600">{question?.text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => {
            setQuizStarted(false);
            setQuizCompleted(false);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setTimeTaken(0);
            setTimeRemaining(timeLimit);
            setResults(null);
          }} className="w-full">Restart Assessment</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {timeLimit > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Timer className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <p className="text-lg font-medium">{currentQuestion.text}</p>
        </div>
        
        <RadioGroup 
          value={answers[currentQuestion.id]} 
          onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
        >
          <div className="space-y-3">
            {currentQuestion.options.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">{option.text}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleNextQuestion} 
          disabled={!answers[currentQuestion.id]}
          className="w-full"
        >
          {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Assessment"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AssessmentQuiz;
