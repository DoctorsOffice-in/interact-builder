import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ArrowRight, RotateCcw, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

interface QuizOption {
  text: string;
  points: number;
  resultCategory: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "single-choice" | "text" | "scale";
  options: string[];
  optionSettings?: QuizOption[];
  image?: string;
  imageUrl?: string;
  required: boolean;
}

interface QuizResult {
  id: string;
  title: string;
  description: string;
  minScore: number;
  maxScore: number;
  redirectUrl?: string;
  couponCode?: string;
  category?: string;
}

interface QuizPreviewProps {
  title: string;
  description: string;
  questions: QuizQuestion[];
  results?: QuizResult[];
  scoringType?: "points" | "category";
  onClose: () => void;
}

export const QuizPreview = ({ title, description, questions, results = [], scoringType = "points", onClose }: QuizPreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
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

  // Calculate score
  const calculateScore = (): number => {
    let totalPoints = 0;
    questions.forEach((q) => {
      const selected = answers[q.id] || [];
      selected.forEach((ans) => {
        const optIndex = q.options.indexOf(ans);
        if (q.optionSettings && q.optionSettings[optIndex]) {
          totalPoints += q.optionSettings[optIndex].points;
        }
      });
    });
    return totalPoints;
  };

  // Calculate category winner
  const getCategoryResult = (): string => {
    const categoryCounts: Record<string, number> = {};
    questions.forEach((q) => {
      const selected = answers[q.id] || [];
      selected.forEach((ans) => {
        const optIndex = q.options.indexOf(ans);
        if (q.optionSettings && q.optionSettings[optIndex]) {
          const cat = q.optionSettings[optIndex].resultCategory;
          if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        }
      });
    });
    let maxCat = "";
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) { maxCat = cat; maxCount = count; }
    });
    return maxCat;
  };

  const getResult = (): QuizResult | null => {
    if (results.length === 0) return null;
    if (scoringType === "points") {
      const score = calculateScore();
      return results.find((r) => score >= r.minScore && score <= r.maxScore) || results[0];
    } else {
      const category = getCategoryResult();
      return results.find((r) => r.category === category) || results[0];
    }
  };

  if (completed) {
    const score = calculateScore();
    const result = getResult();

    return (
      <Card className="max-w-lg mx-auto bg-gradient-card border-border">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-success mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            {result ? result.title : "Thank You!"}
          </h2>

          {result ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">{result.description}</p>

              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="text-4xl font-bold text-primary">{score}</p>
                <p className="text-xs text-muted-foreground mt-1">out of {questions.length * 10} possible points</p>
              </div>

              {result.couponCode && (
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm font-medium text-success mb-2">🎁 Your Special Offer</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-lg font-bold bg-success/20 px-4 py-2 rounded">{result.couponCode}</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(result.couponCode || "");
                        toast.success("Coupon copied!");
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {result.redirectUrl && (
                <Button
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => window.open(result.redirectUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Claim Your Reward
                </Button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-4">
                Your responses have been recorded. Score: {score} points.
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
            </div>
          )}

          <div className="flex gap-3 justify-center mt-4">
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
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="p-6 pt-4">
        {currentQ.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img src={currentQ.imageUrl} alt="" className="w-full h-48 object-cover rounded-lg" />
          </div>
        )}
        <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
        <div className="space-y-2 mb-6">
          {currentQ.options.map((opt, i) => {
            const points = currentQ.optionSettings?.[i]?.points;
            return (
              <button
                key={i}
                className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                  selected.includes(opt)
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:border-primary/50 text-foreground"
                }`}
                onClick={() => handleSelect(currentQ.id, opt)}
              >
                <div className="flex justify-between items-center">
                  <span>{opt}</span>
                  {points !== undefined && (
                    <Badge variant="secondary" className="text-xs ml-2">{points} pts</Badge>
                  )}
                </div>
              </button>
            );
          })}
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
