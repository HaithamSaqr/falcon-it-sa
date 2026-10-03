import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { optionalCtaSchema, checkOptionalCta, b, noCta } from "../fields";

/** Client logos come from the `clients` table; this block only frames them. */
export const logoWallSchema = z
  .object({
    heading: biRequiredSchema,
    intro: biSchema,
    limit: z.number().int().min(1).max(60),
    link: optionalCtaSchema,
  })
  .superRefine((v, ctx) => checkOptionalCta(v.link, ["link"], ctx));

export type LogoWallContent = z.infer<typeof logoWallSchema>;

export const logoWallDefaults = (): LogoWallContent => ({
  heading: b("Companies across Saudi Arabia and Egypt run on ERPs our team implemented"),
  intro: b(""),
  limit: 12,
  link: noCta(),
});
