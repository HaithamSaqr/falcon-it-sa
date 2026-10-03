import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import {
  ctaSchema,
  optionalCtaSchema,
  imageSchema,
  optionalLinkSchema,
  checkOptionalCta,
  b,
  demoCta,
  noCta,
} from "../fields";

/** Image card shown beside the hero text. */
const heroCardSchema = z.object({
  image: imageSchema,
  alt: biSchema,
  caption: biSchema,
});

/** A "See it for" pill. Picking it swaps the subtitle, card image and caption. */
const heroPillSchema = z.object({
  label: biRequiredSchema,
  subtitle: biSchema,
  image: imageSchema,
  alt: biSchema,
  caption: biSchema,
  href: optionalLinkSchema,
});

export const heroSchema = z
  .object({
    title: biRequiredSchema,
    subtitle: biSchema,
    primaryCta: ctaSchema,
    secondaryCta: optionalCtaSchema,
    sectorsLabel: biSchema,
    card: heroCardSchema,
    sectorPills: z.array(heroPillSchema).max(12),
  })
  .superRefine((v, ctx) => checkOptionalCta(v.secondaryCta, ["secondaryCta"], ctx));

export type HeroContent = z.infer<typeof heroSchema>;

export const heroDefaults = (): HeroContent => ({
  title: b("One ERP for your whole company.", "نظام واحد لشركتك كلها."),
  subtitle: b(""),
  primaryCta: demoCta(),
  secondaryCta: noCta(),
  sectorsLabel: b("See it for", "شاهده لقطاع"),
  card: { image: "", alt: b(""), caption: b("") },
  sectorPills: [],
});
