import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { b } from "../fields";

const faqItemSchema = z.object({
  question: biRequiredSchema,
  answer: biSchema,
});

/** Inline questions for this page (the global `faqs` table is separate). */
export const faqRefSchema = z.object({
  heading: biRequiredSchema,
  items: z.array(faqItemSchema).max(24),
});

export type FaqRefContent = z.infer<typeof faqRefSchema>;

export const faqRefDefaults = (): FaqRefContent => ({
  heading: b("Questions we hear often"),
  items: [],
});
