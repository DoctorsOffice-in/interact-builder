import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, RotateCcw } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "single-choice" | "text" | "scale";
  options: string[];
  image?: string;
  required: boolean;
}

interface QuizPreviewProps {
  title: string;
  description: string;
  questions: QuizQuestion[];
  onClose: () => void;
}

export const QuizPreview = ({ title, description, questions, onClose }: QuizPreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro screen
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [completed, setCompleted] = useState(false);

  const progress = currentIndex < 0 ? 0 : ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = (questionId: string, option: string) => {
    const current = answers[questionId] || [];
    const q = questions.find((q) => q.id === questionId);
    if (q?.type === "multiple-choice") {
      if (current.includes(option)) {
        setAnswers({ ...answers, [questionId]: current.filter((o) => o !== option) });
      } else {
        setAnswers({ ...answers, [questionId]: [...current, option] });
      }
    } else {
      setAnswers({ ...answers, [questionId]: [option] });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(-1);
    setAnswers({});
    setCompleted(false);
  };

  if (completed) {
    return (
      <Card className="max-w-lg mx-auto bg-gradient-card border-border">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-muted-foreground mb-4">
            Your responses have been recorded. Our team will review your answers and get back to you soon.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 text-left mb-6">
            <h3 className="font-medium mb-2">Your Responses:</h3>
            {questions.map((q, i) => (
              <div key={q.id} className="mb-2 text-sm">
                <span className="text-muted-foreground">Q{i + 1}:</span>{" "}
                <span className="font-medium">{(answers[q.id] || ["Not answered"]).join(", ")}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Button onClick={onClose}>Close Preview</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentIndex < 0) {
    return (
      <Card className="max-w-lg mx-auto bg-gradient-card border-border">
        <CardContent className="p-8 text-center">
          <Badge className="bg-gradient-primary text-white mb-4">Patient Quiz</Badge>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-2">{description}</p>
          <p className="text-sm text-muted-foreground mb-6">{questions.length} questions • 2 min</p>
          <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setCurrentIndex(0)}>
            Start Quiz
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];
  const selected = answers[currentQ.id] || [];

  return (
    <Card className="max-w-lg mx-auto bg-gradient-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
        <div className="space-y-2 mb-6">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                selected.includes(opt)
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border hover:border-primary/50 text-foreground"
              }`}
              onClick={() => handleSelect(currentQ.id, opt)}
            >
              {opt}
            </button>
          ))}
        </div>
        <Button
          className="w-full bg-gradient-primary hover:opacity-90"
          disabled={selected.length === 0}
          onClick={handleNext}
        >
          {currentIndex === questions.length - 1 ? "Submit" : "Next"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
