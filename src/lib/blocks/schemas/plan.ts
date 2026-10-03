import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { stepSchema, b } from "../fields";

export const planSchema = z.object({
  heading: biRequiredSchema,
  intro: biSchema,
  steps: z.array(stepSchema).max(8),
});

export type PlanContent = z.infer<typeof planSchema>;

export const planDefaults = (): PlanContent => ({
  heading: b("Four steps, no surprises.", "أربع خطوات، ولا مفاجآت."),
  intro: b(""),
  steps: [{ title: b("Assess"), description: b(""), duration: b("") }],
});
