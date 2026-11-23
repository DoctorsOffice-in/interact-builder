export interface DraftAnswer {
  text: string;
  points: 0 | 1 | 2;
}

export interface DraftQuestion {
  question: string;
  options: DraftAnswer[];
}

export interface DraftOutcome {
  title: string;
  description: string;
}

export interface QuizDraft {
  title: string;
  description: string;
  questions: DraftQuestion[];
  outcomes: DraftOutcome[];
}

export const quizDraftJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "questions", "outcomes"],
  properties: {
    title: { type: "string", minLength: 3, maxLength: 100 },
    description: { type: "string", minLength: 12, maxLength: 260 },
    questions: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "options"],
        properties: {
          question: { type: "string", minLength: 8, maxLength: 180 },
          options: {
            type: "array",
            minItems: 3,
            maxItems: 3,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["text", "points"],
              properties: {
                text: { type: "string", minLength: 1, maxLength: 100 },
                points: { type: "integer", enum: [0, 1, 2] },
              },
            },
          },
        },
      },
    },
    outcomes: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 90 },
          description: { type: "string", minLength: 12, maxLength: 320 },
        },
      },
    },
  },
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const diagnosticClaimPatterns = [
  /\bdiagnos(?:e|es|ed|is|tic|tics)\b/i,
  /\byou\s+(?:have|may have|might have|likely have|probably have|are diagnosed with|are at risk of)\b/i,
  /\byour answers?\s+(?:indicate|suggest|show|confirm)\s+(?:that\s+)?you\s+(?:have|may|might|are at risk of)\b/i,
  /\byour results?\s+(?:mean|show|indicate)\s+you\s+(?:have|may have|might have|are at risk of)\b/i,
];

const readText = (
  value: unknown,
  minLength: number,
  maxLength: number,
): string => {
  if (typeof value !== "string") throw new Error("Generated quiz text was invalid.");
  const text = value.trim();
  if (text.length < minLength || text.length > maxLength) {
    throw new Error("Generated quiz text was outside the allowed length.");
  }
  if (diagnosticClaimPatterns.some((pattern) => pattern.test(text))) {
    throw new Error("Generated quiz copy included diagnostic language.");
  }
  return text;
};

export const parseQuizDraft = (value: unknown): QuizDraft => {
  if (!isRecord(value)) throw new Error("Generated quiz was not an object.");

  const title = readText(value.title, 3, 100);
  const description = readText(value.description, 12, 260);
  if (!Array.isArray(value.questions) || value.questions.length !== 5) {
    throw new Error("Generated quiz must contain five questions.");
  }
  if (!Array.isArray(value.outcomes) || value.outcomes.length !== 3) {
    throw new Error("Generated quiz must contain three outcomes.");
  }

  const questions = value.questions.map((questionValue): DraftQuestion => {
    if (!isRecord(questionValue) || !Array.isArray(questionValue.options) || questionValue.options.length !== 3) {
      throw new Error("Generated quiz question was invalid.");
    }
    const options = questionValue.options.map((optionValue): DraftAnswer => {
      if (!isRecord(optionValue) || ![0, 1, 2].includes(optionValue.points as number)) {
        throw new Error("Generated quiz answer score was invalid.");
      }
      return {
        text: readText(optionValue.text, 1, 100),
        points: optionValue.points as 0 | 1 | 2,
      };
    });
    if (options.some((option, index) => option.points !== index)) {
      throw new Error("Generated answer scores must increase from zero to two.");
    }
    return {
      question: readText(questionValue.question, 8, 180),
      options,
    };
  });

  const outcomes = value.outcomes.map((outcomeValue): DraftOutcome => {
    if (!isRecord(outcomeValue)) throw new Error("Generated quiz outcome was invalid.");
    return {
      title: readText(outcomeValue.title, 3, 90),
      description: readText(outcomeValue.description, 12, 320),
    };
  });

  return { title, description, questions, outcomes };
};