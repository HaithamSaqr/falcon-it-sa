import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { imageSchema, linkSchema, b, demoCta } from "../fields";

const sectorCardSchema = z.object({
  title: biRequiredSchema,
  line: biSchema,
  image: imageSchema,
  imageAlt: biSchema,
  href: linkSchema,
});

/** The closing "Don't see your sector?" card. */
const otherCardSchema = z.object({
  title: biRequiredSchema,
  line: biSchema,
  ctaLabel: biRequiredSchema,
  href: linkSchema,
});

export const sectorGridSchema = z.object({
  heading: biRequiredSchema,
  intro: biSchema,
  cards: z.array(sectorCardSchema).max(16),
  otherCard: otherCardSchema,
});

export type SectorGridContent = z.infer<typeof sectorGridSchema>;

export const sectorGridDefaults = (): SectorGridContent => ({
  heading: b("The same ERP, set up for your sector.", "نفس النظام، مضبوط لقطاعك."),
  intro: b(""),
  cards: [],
  otherCard: {
    title: b("Don't see your sector?", "لا ترى قطاعك؟"),
    line: b("Tell us how your business runs. We'll show you the ERP set up for it."),
    ctaLabel: demoCta().label,
    href: "/demo",
  },
});
