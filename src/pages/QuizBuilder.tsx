import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { QuizPreview } from "@/components/QuizPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Image, 
  Save, 
  Eye, 
  ArrowLeft,
  Settings,
  Palette
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "single-choice" | "text" | "scale";
  options: string[];
  image?: string;
  required: boolean;
}

interface QuizSettings {
  title: string;
  description: string;
  category: string;
  coverImage?: string;
}

export const QuizBuilder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"questions" | "design" | "settings">("questions");
  const [showPreview, setShowPreview] = useState(false);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    title: "Patient Engagement Quiz",
    description: "Help patients understand their health needs and connect with your practice",
    category: "Patient Engagement"
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: "1",
      question: "What is your primary health concern?",
      type: "multiple-choice",
      options: ["Preventive Care", "Chronic Condition Management", "Acute Symptoms", "Wellness & Lifestyle"],
      required: true
    }
  ]);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: "New question",
      type: "multiple-choice",
      options: ["Option 1", "Option 2"],
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      updateQuestion(questionId, {
        options: [...question.options, `Option ${question.options.length + 1}`]
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const handleSaveQuiz = () => {
    toast.success("Quiz saved successfully!");
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const doctorTemplates = [
    "Patient Satisfaction Survey",
    "Health Risk Assessment", 
    "Symptom Checker",
    "Appointment Booking Quiz",
    "Insurance Coverage Checker",
    "Wellness Program Enrollment"
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Quiz Builder</h1>
                <p className="text-muted-foreground">Create engaging quizzes for your patients</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSaveQuiz} className="bg-gradient-primary hover:opacity-90">
                <Save className="w-4 h-4 mr-2" />
                Save Quiz
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Builder Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tabs */}
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "questions", label: "Questions", icon: Plus },
                      { id: "design", label: "Design", icon: Palette },
                      { id: "settings", label: "Settings", icon: Settings }
                    ].map((tab) => (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        className={`justify-start ${activeTab === tab.id ? "bg-gradient-primary" : ""}`}
                        onClick={() => setActiveTab(tab.id as any)}
                      >
                        <tab.icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </Button>
                    ))}
                  </div>

                  {activeTab === "questions" && (
                    <div className="space-y-3">
                      <Button onClick={addQuestion} className="w-full" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                      
                      <div>
                        <Label className="text-sm font-medium">Quick Templates</Label>
                        <div className="mt-2 space-y-1">
                          {doctorTemplates.slice(0, 3).map((template, index) => (
                            <Button 
                              key={index}
                              variant="ghost" 
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => toast.info(`Loading ${template} template...`)}
                            >
                              {template}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Builder Area */}
            <div className="lg:col-span-3">
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Input 
                        value={quizSettings.title}
                        onChange={(e) => setQuizSettings({...quizSettings, title: e.target.value})}
                        className="text-xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0"
                        placeholder="Quiz Title"
                      />
                      <Textarea
                        value={quizSettings.description}
                        onChange={(e) => setQuizSettings({...quizSettings, description: e.target.value})}
                        className="mt-2 bg-transparent border-0 p-0 focus-visible:ring-0 resize-none"
                        placeholder="Quiz description..."
                        rows={2}
                      />
                    </div>
                    <Badge className="bg-gradient-primary text-white">
                      {quizSettings.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="border border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">Q{index + 1}</Badge>
                              <Badge variant="outline" className="text-xs">
                                {question.type.replace("-", " ")}
                              </Badge>
                            </div>
                            <Input
                              value={question.question}
                              onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                              placeholder="Enter your question..."
                              className="text-base font-medium"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => updateQuestion(question.id, { image: question.image ? undefined : "placeholder" })}
                            >
                              <Image className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => deleteQuestion(question.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        
                        {question.image && (
                          <div className="mt-3 p-4 border border-dashed border-border rounded-lg text-center">
                            <Image className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload image</p>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                              {question.options.length > 2 && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            onClick={() => addOption(question.id)}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {questions.length === 0 && (
                    <div className="text-center py-12">
                      <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start building your quiz by adding your first question
                      </p>
                      <Button onClick={addQuestion} className="bg-gradient-primary hover:opacity-90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Question
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};