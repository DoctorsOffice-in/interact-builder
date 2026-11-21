import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { contentInputSchema, leadInputSchema } from "./content-validation";

describe("content library validation", () => {
  it("accepts saved quizzes", () => {
    assert.equal(contentInputSchema.safeParse({ contentType: "quiz", title: "Patient quiz", content: {} }).success, true);
  });

  it("accepts saved calculators", () => {
    assert.equal(contentInputSchema.safeParse({ contentType: "calculator", title: "BMI", content: {} }).success, true);
  });

  it("accepts saved chatbots", () => {
    assert.equal(contentInputSchema.safeParse({ contentType: "chatbot", title: "Clinic bot", content: {} }).success, true);
  });

  it("accepts saved spin wheels", () => {
    assert.equal(contentInputSchema.safeParse({ contentType: "spin-wheel", title: "Clinic offers", content: {} }).success, true);
  });

  it("requires visitor consent before a lead is submitted", () => {
    assert.equal(leadInputSchema.safeParse({ fullName: "Pat Lee", email: "pat@example.com", phone: "", consent: false }).success, false);
  });
});