declare function describe(name: string, run: () => void): void;
declare function it(name: string, run: () => void): void;
declare function expect<T>(actual: T): { toBe(expected: unknown): void };
import { contentInputSchema, leadInputSchema } from "./content-validation";

describe("content library validation", () => {
  it("accepts saved quizzes", () => {
    expect(contentInputSchema.safeParse({ contentType: "quiz", title: "Patient quiz", content: {} }).success).toBe(true);
  });

  it("accepts saved calculators", () => {
    expect(contentInputSchema.safeParse({ contentType: "calculator", title: "BMI", content: {} }).success).toBe(true);
  });

  it("accepts saved chatbots", () => {
    expect(contentInputSchema.safeParse({ contentType: "chatbot", title: "Clinic bot", content: {} }).success).toBe(true);
  });

  it("accepts saved spin wheels", () => {
    expect(contentInputSchema.safeParse({ contentType: "spin-wheel", title: "Clinic offers", content: {} }).success).toBe(true);
  });

  it("requires visitor consent before a lead is submitted", () => {
    expect(leadInputSchema.safeParse({ fullName: "Pat Lee", email: "pat@example.com", phone: "", consent: false }).success).toBe(false);
  });
});