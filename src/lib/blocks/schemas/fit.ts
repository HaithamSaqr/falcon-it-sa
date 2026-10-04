import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { b } from "../fields";

/** When one of the two systems is the better fit for this sector. */
const fitOptionSchema = z.object({
  name: biRequiredSchema,
  when: biSchema,
  points: z.array(biSchema).max(12),
});

export const fitSchema = z.object({
  heading: biRequiredSchema,
  intro: biSchema,
  odoo: fitOptionSchema,
  falcon: fitOptionSchema,
  closing: biSchema,
});

export type FitContent = z.infer<typeof fitSchema>;

export const fitDefaults = (): FitContent => ({
  heading: b("Odoo or Falcon? We will tell you plainly.", "أودو أم فالكون؟ سنقولها لك بصراحة."),
  intro: b(""),
  odoo: { name: b("Odoo"), when: b(""), points: [] },
  falcon: { name: b("Falcon ERP", "فالكون ERP"), when: b(""), points: [] },
  closing: b(""),
});
