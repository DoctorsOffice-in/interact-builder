import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, HeartPulse, LoaderCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const optionSchema = z.object({
  text: z.string().max(500).optional(),
  points: z.number().finite().min(-10000).max(10000).optional(),
  resultCategory: z.string().max(100).optional(),
});

const questionSchema = z.object({
  id: z.string().max(100),
  question: z.string().min(1).max(1000),
  type: z.enum(["multiple-choice", "single-choice", "text", "scale"]),
  options: z.array(z.string().max(500)).max(30),
  optionSettings: z.array(optionSchema).max(30).optional(),
  imageUrl: z.string().max(2_000_000).optional(),
  required: z.boolean().optional(),
});

const resultSchema = z.object({
  id: z.string().max(100),
  title: z.string().max(160),
  description: z.string().max(2000),
  minScore: z.number().finite(),
  maxScore: z.number().finite(),
  redirectUrl: z.string().max(2000).optional(),
  couponCode: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
});

const publishedQuizSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(160),
  slug: z.string().max(180),
  content: z.object({
    settings: z.object({
      title: z.string().max(160).optional(),
      description: z.string().max(2000).optional(),
      scoringType: z.enum(["points", "category"]).optional(),
    }).passthrough(),
    questions: z.array(questionSchema).max(50),
    results: z.array(resultSchema).max(50).optional(),
  }).passthrough(),
});

const leadSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(100, "Name must be 100 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address.").max(255, "Email must be 255 characters or fewer."),
  phone: z.string().trim().max(50, "Phone number must be 50 characters or fewer."),
  consent: z.boolean().refine(Boolean, "Please agree before sending your responses."),
});

type PublishedQuiz = z.infer<typeof publishedQuizSchema>;

export const PublicQuiz = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [quiz, setQuiz] = useState<PublishedQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [savedResult, setSavedResult] = useState(false);

  useEffect(() => {
    let active = true;
    const loadQuiz = async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("get_published_quiz", { p_slug: slug });
      const parsed = publishedQuizSchema.safeParse(data);
      if (!active) return;
      if (error || !parsed.success || parsed.data.content.questions.length === 0) {
        setLoadError(true);
      } else {
        setQuiz(parsed.data);
      }
      setLoading(false);
    };
    if (slug.length > 0 && slug.length <= 180) void loadQuiz();
    else {
      setLoadError(true);
      setLoading(false);
    }
    return () => { active = false; };
  }, [slug]);

  const questions = quiz?.content.questions ?? [];
  const results = quiz?.content.results ?? [];
  const scoringType = quiz?.content.settings.scoringType ?? "points";
  const progress = questions.length > 0 ? (questionIndex / questions.length) * 100 : 0;

  const score = useMemo(() => questions.reduce((total, question) => {
    const selected = answers[question.id] ?? [];
    return total + selected.reduce((sum, answer) => {
      const index = question.options.indexOf(answer);
      return sum + (question.optionSettings?.[index]?.points ?? 0);
    }, 0);
  }, 0), [answers, questions]);

  const result = useMemo(() => {
    if (results.length === 0) return null;
    if (scoringType === "category") {
      const categories: Record<string, number> = {};
      questions.forEach((question) => {
        (answers[question.id] ?? []).forEach((answer) => {
          const index = question.options.indexOf(answer);
          const category = question.optionSettings?.[index]?.resultCategory;
          if (category) categories[category] = (categories[category] ?? 0) + 1;
        });
      });
      const winner = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0];
      return results.find((item) => item.category === winner) ?? results[0];
    }
    return results.find((item) => score >= item.minScore && score <= item.maxScore) ?? results[0];
  }, [answers, questions, results, score, scoringType]);

  const selectedAnswer = answers[questions[questionIndex]?.id] ?? [];

  const continueQuiz = () => {
    if (questionIndex + 1 < questions.length) setQuestionIndex((current) => current + 1);
    else setShowLeadForm(true);
  };

  const submitLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = leadSchema.safeParse({ fullName, email, phone, consent });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => { errors[String(issue.path[0])] = issue.message; });
      setFieldErrors(errors);
      return;
    }
    if (!quiz) return;
    setFieldErrors({});
    setSending(true);
    const { error } = await supabase.rpc("submit_quiz_lead", {
      p_slug: quiz.slug,
      p_full_name: parsed.data.fullName,
      p_email: parsed.data.email,
      p_phone: parsed.data.phone || null,
      p_responses: answers,
      p_result_title: result?.title ?? null,
      p_score: score,
      p_consent: parsed.data.consent,
    });
    setSending(false);
    if (error) {
      setFieldErrors({ form: "We couldn’t send your responses. Please try again." });
    } else {
      setSavedResult(true);
    }
  };

  const resetQuiz = () => {
    setQuestionIndex(0);
    setAnswers({});
    setShowLeadForm(false);
    setSavedResult(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setConsent(false);
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center p-6"><LoaderCircle className="w-6 h-6 animate-spin text-primary" aria-label="Loading quiz" /></main>;
  }
  if (loadError || !quiz) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full"><CardContent className="p-8 text-center">
          <HeartPulse className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-semibold mb-2">This quiz isn’t available</h1>
          <p className="text-muted-foreground">The link may be incorrect, or the practice has unpublished this quiz.</p>
        </CardContent></Card>
      </main>
    );
  }

  const quizTitle = quiz.content.settings.title || quiz.title;
  const redirectUrl = result?.redirectUrl?.trim();
  const safeRedirectUrl = redirectUrl && /^https:\/\//i.test(redirectUrl) ? redirectUrl : null;

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground"><HeartPulse className="h-5 w-5" /></div>
          <div><p className="font-semibold">Doctors Buddy</p><p className="text-xs text-muted-foreground">A patient experience from your care team</p></div>
        </header>

        <section className="mb-6">
          <Badge variant="secondary">{showLeadForm || savedResult ? "Your result" : "Patient quiz"}</Badge>
          <h1 className="mt-3 text-3xl font-semibold">{quizTitle}</h1>
          <p className="mt-2 text-muted-foreground">{quiz.content.settings.description}</p>
        </section>

        {savedResult ? (
          <Card><CardContent className="p-7 sm:p-9">
            <CheckCircle2 className="h-10 w-10 text-success mb-4" />
            <h2 className="text-2xl font-semibold">{result?.title ?? "Thank you for sharing"}</h2>
            <p className="mt-3 text-muted-foreground">{result?.description ?? "Your responses have been shared with the care team."}</p>
            {result?.couponCode && <p className="mt-5 rounded-md bg-muted p-4">Your offer code: <strong>{result.couponCode}</strong></p>}
            {safeRedirectUrl && <Button className="mt-5" asChild><a href={safeRedirectUrl} target="_blank" rel="noopener noreferrer">Continue to practice <ExternalLink className="ml-2 h-4 w-4" /></a></Button>}
            <p className="mt-5 text-xs text-muted-foreground">For education and practice engagement only. This quiz is not a medical diagnosis.</p>
          </CardContent></Card>
        ) : showLeadForm ? (
          <Card><CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold">See your personalized result</h2>
            <p className="mt-2 text-sm text-muted-foreground">Share your contact details so the practice can follow up about your responses.</p>
            <form className="mt-6 space-y-4" onSubmit={submitLead} noValidate>
              <div className="space-y-2"><Label htmlFor="patient-name">Name</Label><Input id="patient-name" autoComplete="name" maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} aria-invalid={Boolean(fieldErrors.fullName)} />{fieldErrors.fullName && <p className="text-sm text-destructive">{fieldErrors.fullName}</p>}</div>
              <div className="space-y-2"><Label htmlFor="patient-email">Email</Label><Input id="patient-email" type="email" autoComplete="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(fieldErrors.email)} />{fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}</div>
              <div className="space-y-2"><Label htmlFor="patient-phone">Phone <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="patient-phone" type="tel" autoComplete="tel" maxLength={50} value={phone} onChange={(event) => setPhone(event.target.value)} aria-invalid={Boolean(fieldErrors.phone)} />{fieldErrors.phone && <p className="text-sm text-destructive">{fieldErrors.phone}</p>}</div>
              <div className="flex items-start gap-3"><Checkbox id="patient-consent" checked={consent} onCheckedChange={(checked) => setConsent(checked === true)} /><Label htmlFor="patient-consent" className="font-normal leading-relaxed">I agree to share these quiz responses and contact details with the practice so they can follow up with me.</Label></div>
              {fieldErrors.consent && <p className="text-sm text-destructive">{fieldErrors.consent}</p>}
              {fieldErrors.form && <p role="alert" className="text-sm text-destructive">{fieldErrors.form}</p>}
              <Button type="submit" className="w-full" disabled={sending}>{sending ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Sending</> : <>View my result <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">For educational and practice engagement only. This quiz does not provide a diagnosis.</p>
          </CardContent></Card>
        ) : (
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between text-sm text-muted-foreground"><span>Question {questionIndex + 1} of {questions.length}</span><span>{Math.round(progress)}%</span></div>
              <Progress value={progress} className="mb-7 h-2" />
              {questions[questionIndex].imageUrl && <img src={questions[questionIndex].imageUrl} alt="" className="mb-6 max-h-64 w-full rounded-md object-cover" />}
              <h2 className="text-xl font-semibold">{questions[questionIndex].question}</h2>
              <div className="mt-5 space-y-2">
                {questions[questionIndex].options.map((option, index) => {
                  const isSelected = selectedAnswer.includes(option);
                  return <Button key={`${questions[questionIndex].id}-${index}`} type="button" variant={isSelected ? "secondary" : "outline"} className="h-auto min-h-12 w-full justify-between whitespace-normal py-3 text-left" onClick={() => setAnswers((current) => {
                    const selected = current[questions[questionIndex].id] ?? [];
                    const next = questions[questionIndex].type === "multiple-choice"
                      ? (selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])
                      : [option];
                    return { ...current, [questions[questionIndex].id]: next };
                  })}>{option}<span aria-hidden="true" className="ml-3 text-primary">{isSelected ? "✓" : ""}</span></Button>;
                })}
              </div>
              <div className="mt-7 flex justify-between gap-3">
                <Button type="button" variant="ghost" disabled={questionIndex === 0} onClick={() => setQuestionIndex((current) => current - 1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button type="button" disabled={selectedAnswer.length === 0 && questions[questionIndex].required !== false} onClick={continueQuiz}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        )}
        <footer className="mt-8 text-center text-xs text-muted-foreground"><p>Shared securely with the practice when you choose to submit.</p><Link to="/" className="mt-2 inline-block underline">Doctors Buddy</Link></footer>
      </div>
    </main>
  );
};