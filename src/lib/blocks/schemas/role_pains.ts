import { z } from "zod";
import { biSchema, biRequiredSchema } from "../bi";
import { roleIdSchema, b } from "../fields";
import { rolesSchema, checkRoles, checkRecordKeys, defaultRoles } from "../roles";

/** One pain and how the system fixes it. */
const painSchema = z.object({
  pain: biRequiredSchema,
  fix: biSchema,
});

const rolePainsEntrySchema = z.object({
  headline: biSchema,
  items: z.array(painSchema).max(12),
});

export const rolePainsSchema = z
  .object({
    heading: biRequiredSchema,
    intro: biSchema,
    roles: rolesSchema,
    pains: z.record(roleIdSchema, rolePainsEntrySchema),
  })
  .superRefine((v, ctx) => {
    const declared = checkRoles(v.roles, ctx);
    checkRecordKeys("pains", v.pains, declared, ctx);
  });

export type RolePainsContent = z.infer<typeof rolePainsSchema>;

export const rolePainsDefaults = (): RolePainsContent => ({
  heading: b("Sound familiar?"),
  intro: b(""),
  roles: defaultRoles(),
  pains: {},
});
