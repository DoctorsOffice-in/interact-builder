import { z } from "zod";

export const contentTypeSchema = z.enum(["quiz", "calculator", "chatbot", "spin-wheel"]);

export const contentInputSchema = z.object({
  id: z.string().uuid().optional(),
  contentType: contentTypeSchema,
  title: z.string().trim().min(1, "Add a title before saving.").max(160, "Titles must be 160 characters or fewer."),
  content: z.record(z.unknown()),
  publish: z.boolean().default(false),
});

export const leadInputSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  phone: z.string().trim().max(50),
  consent: z.boolean().refine(Boolean, "Please agree before sending your responses."),
});