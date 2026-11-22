import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { QuizPreview } from "@/components/QuizPreview";
import { QuizQuestionEditor } from "@/components/QuizQuestionEditor";
import { QuizResultsEditor } from "@/components/QuizResultsEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Save, Eye, ArrowLeft, Settings, Palette, Trophy, GripVertical, Code2
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { EmbedCodeDialog } from "@/components/EmbedCodeDialog";
import { getContentItem, saveContentItem } from "@/lib/content-storage";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export interface QuizOption {
  text: string;
  points: number;
  resultCategory: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "single-choice" | "text" | "scale";
  options: string[];
  optionSettings?: QuizOption[];
  image?: string;
  imageUrl?: string;
  required: boolean;
}

export interface QuizResult {
  id: string;
  title: string;
  description: string;
  minScore: number;
  maxScore: number;
  redirectUrl?: string;
  couponCode?: string;
  category?: string;
}

interface QuizSettings {
  title: string;
  description: string;
  category: string;
  coverImage?: string;
  scoringType: "points" | "category";
}

export const QuizBuilder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"questions" | "results" | "design" | "settings">("questions");
  const [showPreview, setShowPreview] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | undefined>(undefined);
  const [savedSlug, setSavedSlug] = useState<string | undefined>(undefined);
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(Boolean(searchParams.get("id")));
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    title: "Patient Engagement Quiz",
    description: "Help patients understand their health needs and connect with your practice",
    category: "Patient Engagement",
    scoringType: "points",
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: "1",
      question: "What is your primary health concern?",
      type: "single-choice",
      options: ["Preventive Care", "Chronic Condition Management", "Acute Symptoms", "Wellness & Lifestyle"],
      optionSettings: [
        { text: "Preventive Care", points: 5, resultCategory: "Preventive" },
        { text: "Chronic Condition Management", points: 10, resultCategory: "Chronic" },
        { text: "Acute Symptoms", points: 8, resultCategory: "Acute" },
        { text: "Wellness & Lifestyle", points: 3, resultCategory: "Wellness" },
      ],
      required: true,
    },
  ]);

  const [results, setResults] = useState<QuizResult[]>([
    { id: "r1", title: "Wellness Champion 🌟", description: "You're proactive about your health! Keep up the great work.", minScore: 0, maxScore: 5, redirectUrl: "", couponCode: "WELL10", category: "Wellness" },
    { id: "r2", title: "Health-Conscious Patient 💪", description: "You take your health seriously. Let's build a plan together.", minScore: 6, maxScore: 15, redirectUrl: "", couponCode: "HEALTH20", category: "Preventive" },
    { id: "r3", title: "Priority Care Needed 🏥", description: "We recommend scheduling a comprehensive consultation soon.", minScore: 16, maxScore: 100, redirectUrl: "", couponCode: "CARE30", category: "Chronic" },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForQuestion, setUploadingForQuestion] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) {
      setLoadingExisting(false);
      return;
    }
    let active = true;
    setLoadingExisting(true);
    void getContentItem(id).then((item) => {
      if (!active) return;
      if (!item || item.content_type !== "quiz") {
        toast.error("That saved quiz could not be found.");
        setLoadingExisting(false);
        return;
      }
      const content = item.content as unknown as { settings?: Partial<QuizSettings>; questions?: QuizQuestion[]; results?: QuizResult[] };
      setQuizSettings((current) => ({ ...current, ...content.settings, title: content.settings?.title || item.title }));
      setQuestions(content.questions ?? []);
      setResults(content.results ?? []);
      setSavedItemId(item.id);
      setSavedSlug(item.slug);
      setIsPublished(item.is_published);
      setLoadingExisting(false);
    }).catch((error: unknown) => {
      if (active) {
        toast.error(error instanceof Error ? error.message : "Could not load this quiz.");
        setLoadingExisting(false);
      }
    });
    return () => { active = false; };
  }, [searchParams]);

  const saveQuiz = async (publish: boolean) => {
    setSaving(true);
    try {
      const item = await saveContentItem({
        id: savedItemId,
        contentType: "quiz",
        title: quizSettings.title,
        content: { settings: quizSettings, questions, results },
        publish,
      });
      setSavedItemId(item.id);
      setSavedSlug(item.slug);
      setIsPublished(item.is_published);
      if (!savedItemId) setSearchParams({ id: item.id }, { replace: true });
      toast.success(publish ? "Quiz published and ready to share." : "Quiz saved as a draft.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Quiz could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: Date.now().toString(),
      question: "New question",
      type: "single-choice",
      options: ["Option 1", "Option 2"],
      optionSettings: [
        { text: "Option 1", points: 0, resultCategory: "" },
        { text: "Option 2", points: 0, resultCategory: "" },
      ],
      required: false,
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const newOpt = `Option ${question.options.length + 1}`;
      updateQuestion(questionId, {
        options: [...question.options, newOpt],
        optionSettings: [
          ...(question.optionSettings || []),
          { text: newOpt, points: 0, resultCategory: "" },
        ],
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      const newSettings = [...(question.optionSettings || [])];
      if (newSettings[optionIndex]) newSettings[optionIndex] = { ...newSettings[optionIndex], text: value };
      updateQuestion(questionId, { options: newOptions, optionSettings: newSettings });
    }
  };

  const updateOptionSettings = (questionId: string, optionIndex: number, updates: Partial<QuizOption>) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.optionSettings) {
      const newSettings = [...question.optionSettings];
      newSettings[optionIndex] = { ...newSettings[optionIndex], ...updates };
      updateQuestion(questionId, { optionSettings: newSettings });
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question && question.options.length > 2) {
      updateQuestion(questionId, {
        options: question.options.filter((_, i) => i !== optionIndex),
        optionSettings: (question.optionSettings || []).filter((_, i) => i !== optionIndex),
      });
    }
  };

  const handleImageUpload = (questionId: string) => {
    setUploadingForQuestion(questionId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingForQuestion) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateQuestion(uploadingForQuestion, { imageUrl: dataUrl, image: file.name });
      toast.success("Image uploaded!");
      setUploadingForQuestion(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const doctorTemplates = [
    "Patient Satisfaction Survey",
    "Health Risk Assessment",
    "Symptom Checker",
    "Appointment Booking Quiz",
    "Insurance Coverage Checker",
    "Wellness Program Enrollment",
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/")} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Quiz Builder</h1>
                <p className="text-muted-foreground">Create engaging quizzes with scoring & results</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" onClick={() => setShowEmbed(true)} disabled={!isPublished || !savedSlug}>
                <Code2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => void saveQuiz(isPublished)} className="bg-gradient-primary hover:opacity-90" disabled={saving || loadingExisting}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving…" : isPublished ? "Save Changes" : "Save Draft"}
              </Button>
              {!isPublished && <Button onClick={() => void saveQuiz(true)} disabled={saving || loadingExisting}>
                {saving ? "Publishing…" : "Publish Quiz"}
              </Button>
              }
            </div>
          </div>

          <EmbedCodeDialog
            open={showEmbed}
            onOpenChange={setShowEmbed}
            contentType="quiz"
            contentTitle={quizSettings.title}
            contentId={savedSlug}
          />

          {showPreview ? (
            <QuizPreview
              title={quizSettings.title}
              description={quizSettings.description}
              questions={questions}
              results={results}
              scoringType={quizSettings.scoringType}
              onClose={() => setShowPreview(false)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Builder Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                      {[
                        { id: "questions", label: "Questions", icon: Plus },
                        { id: "results", label: "Results", icon: Trophy },
                        { id: "design", label: "Design", icon: Palette },
                        { id: "settings", label: "Settings", icon: Settings },
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
                          <Label className="text-sm font-medium">Scoring Type</Label>
                          <Select
                            value={quizSettings.scoringType}
                            onValueChange={(v) =>
                              setQuizSettings({ ...quizSettings, scoringType: v as "points" | "category" })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="points">Points-based</SelectItem>
                              <SelectItem value="category">Category-based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Quick Templates</Label>
                          <div className="mt-2 space-y-1">
                            {doctorTemplates.slice(0, 3).map((template, i) => (
                              <Button
                                key={i}
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

              {/* Main Area */}
              <div className="lg:col-span-3">
                {activeTab === "results" ? (
                  <QuizResultsEditor
                    results={results}
                    onUpdateResults={setResults}
                    scoringType={quizSettings.scoringType}
                  />
                ) : (
                  <Card className="bg-gradient-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Input
                            value={quizSettings.title}
                            onChange={(e) => setQuizSettings({ ...quizSettings, title: e.target.value })}
                            className="text-xl font-semibold bg-transparent border-0 p-0 focus-visible:ring-0"
                            placeholder="Quiz Title"
                          />
                          <Textarea
                            value={quizSettings.description}
                            onChange={(e) => setQuizSettings({ ...quizSettings, description: e.target.value })}
                            className="mt-2 bg-transparent border-0 p-0 focus-visible:ring-0 resize-none"
                            placeholder="Quiz description..."
                            rows={2}
                          />
                        </div>
                        <Badge className="bg-gradient-primary text-white ml-4">{quizSettings.category}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                          {questions.map((question, index) => (
                            <QuizQuestionEditor
                              key={question.id}
                              question={question}
                              index={index}
                              scoringType={quizSettings.scoringType}
                              onUpdate={updateQuestion}
                              onDelete={deleteQuestion}
                              onAddOption={addOption}
                              onUpdateOption={updateOption}
                              onUpdateOptionSettings={updateOptionSettings}
                              onRemoveOption={removeOption}
                              onImageUpload={handleImageUpload}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>

                      {questions.length === 0 && (
                        <div className="text-center py-12">
                          <Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                          <p className="text-muted-foreground mb-4">Start building your quiz by adding your first question</p>
                          <Button onClick={addQuestion} className="bg-gradient-primary hover:opacity-90">
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Question
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
