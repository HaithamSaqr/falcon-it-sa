import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { optionalCtaSchema, checkOptionalCta, b, noCta } from "../fields";

const setupPointSchema = z.object({
  problem: biRequiredSchema,
  fix: biSchema,
});

export const setupListSchema = z
  .object({
    heading: biRequiredSchema,
    intro: biSchema,
    points: z.array(setupPointSchema).max(12),
    link: optionalCtaSchema,
  })
  .superRefine((v, ctx) => checkOptionalCta(v.link, ["link"], ctx));

export type SetupListContent = z.infer<typeof setupListSchema>;

export const setupListDefaults = (): SetupListContent => ({
  heading: b("An ERP is only as good as its setup.", "قوة النظام في إعداده."),
  intro: b(""),
  points: [],
  link: noCta(),
});
