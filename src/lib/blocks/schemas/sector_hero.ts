import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import {
  ctaSchema,
  optionalCtaSchema,
  imageSchema,
  roleIdSchema,
  checkOptionalCta,
  b,
  demoCta,
  noCta,
} from "../fields";
import { rolesSchema, checkRoles, checkRecordKeys, checkRecordComplete, defaultRoles } from "../roles";

/** The hero promise shown while a role is selected. */
const rolePromiseSchema = z.object({
  title: biRequiredSchema,
  subtitle: biSchema,
});

export const sectorHeroSchema = z
  .object({
    roles: rolesSchema,
    rolePrompt: biSchema,
    promise: z.record(roleIdSchema, rolePromiseSchema),
    photo: imageSchema,
    photoAlt: biSchema,
    trustLine: biSchema,
    primaryCta: ctaSchema,
    secondaryCta: optionalCtaSchema,
  })
  .superRefine((v, ctx) => {
    const declared = checkRoles(v.roles, ctx);
    checkRecordKeys("promise", v.promise, declared, ctx);
    checkRecordComplete("promise", v.promise, declared, ctx);
    checkOptionalCta(v.secondaryCta, ["secondaryCta"], ctx);
  });

export type SectorHeroContent = z.infer<typeof sectorHeroSchema>;

export const sectorHeroDefaults = (): SectorHeroContent => ({
  roles: defaultRoles(),
  rolePrompt: b("I am", "أنا"),
  promise: {
    main: { title: b("Know your numbers every morning."), subtitle: b("") },
  },
  photo: "",
  photoAlt: b(""),
  trustLine: b(""),
  primaryCta: demoCta(),
  secondaryCta: noCta(),
});
