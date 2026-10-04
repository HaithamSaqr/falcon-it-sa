import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { stepSchema, b } from "../fields";

export const processSchema = z.object({
  heading: biRequiredSchema,
  intro: biSchema,
  steps: z.array(stepSchema).max(10),
});

export type ProcessContent = z.infer<typeof processSchema>;

export const processDefaults = (): ProcessContent => ({
  heading: b("From first call to a live ERP, one team.", "من أول اتصال إلى نظام يعمل، فريق واحد."),
  intro: b(""),
  steps: [{ title: b("Assess"), description: b(""), duration: b("") }],
});
