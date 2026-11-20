import { describe, expect, test } from "bun:test";
import { contentInputSchema, leadInputSchema } from "./content-validation";

describe("content library validation", () => {
  test("accepts saved quizzes", () => {
    expect(contentInputSchema.safeParse({ contentType: "quiz", title: "Patient quiz", content: {} }).success).toBe(true);
  });

  test("accepts saved calculators", () => {
    expect(contentInputSchema.safeParse({ contentType: "calculator", title: "BMI", content: {} }).success).toBe(true);
  });

  test("accepts saved chatbots", () => {
    expect(contentInputSchema.safeParse({ contentType: "chatbot", title: "Clinic bot", content: {} }).success).toBe(true);
  });

  test("accepts saved spin wheels", () => {
    expect(contentInputSchema.safeParse({ contentType: "spin-wheel", title: "Clinic offers", content: {} }).success).toBe(true);
  });

  test("requires visitor consent before a lead is submitted", () => {
    expect(leadInputSchema.safeParse({ fullName: "Pat Lee", email: "pat@example.com", phone: "", consent: false }).success).toBe(false);
  });
});