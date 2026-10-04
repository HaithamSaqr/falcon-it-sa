import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { b } from "../fields";

/** Frames the demo booking form. The form fields and API contract are fixed in code. */
export const demoFormSchema = z.object({
  heading: biRequiredSchema,
  body: biSchema,
  submitLabel: biSchema,
  privacyNote: biSchema,
});

export type DemoFormContent = z.infer<typeof demoFormSchema>;

export const demoFormDefaults = (): DemoFormContent => ({
  heading: b("Book a demo", "احجز عرضًا تجريبيًا"),
  body: b(""),
  submitLabel: b("Book a demo", "احجز عرضًا تجريبيًا"),
  privacyNote: b(""),
});
