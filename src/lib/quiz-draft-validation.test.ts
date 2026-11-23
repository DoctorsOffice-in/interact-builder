declare function describe(name: string, run: () => void): void;
declare function it(name: string, run: () => void): void;
declare function expect<T>(actual: T): { toBe(expected: unknown): void };
import { parseQuizDraft } from "../../supabase/functions/_shared/quiz-draft";

const makeDraft = () => ({
  title: "Explore heart health",
  description: "Find a helpful way to learn more about heart health.",
  questions: Array.from({ length: 5 }, (_, index) => ({
    question: `What would help you learn more about heart health ${index + 1}?`,
    options: [
      { text: "Just browsing", points: 0 },
      { text: "A short guide", points: 1 },
      { text: "A clinic conversation", points: 2 },
    ],
  })),
  outcomes: [
    { title: "Start with the basics", description: "A short guide can be a comfortable first step." },
    { title: "Keep exploring", description: "Learn about the clinic's general wellness services." },
    { title: "Connect with the clinic", description: "Contact the clinic if you would like to learn more." },
  ],
});

const isRejected = (value: unknown) => {
  try {
    parseQuizDraft(value);
    return false;
  } catch {
    return true;
  }
};

describe("AI quiz draft safety and structure", () => {
  it("accepts five questions, three ordered scored answers, and three outcomes", () => {
    expect(parseQuizDraft(makeDraft()).questions.length).toBe(5);
  });

  it("rejects drafts that do not contain five questions", () => {
    const draft = makeDraft();
    draft.questions.pop();
    expect(isRejected(draft)).toBe(true);
  });

  it("rejects answer choices without the 0, 1, 2 point mapping", () => {
    const draft = makeDraft();
    draft.questions[0].options[1].points = 0;
    expect(isRejected(draft)).toBe(true);
  });

  it("rejects direct diagnostic claims in generated copy", () => {
    const draft = makeDraft();
    draft.outcomes[0].title = "You may have heart disease";
    expect(isRejected(draft)).toBe(true);
  });
});